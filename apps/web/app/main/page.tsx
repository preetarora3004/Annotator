"use client"

import { Canvas, PencilBrush, Rect, Circle, Path, TEvent, TPointerEventInfo, Point } from "fabric";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from "next-auth/react";
import { LoaderIcon } from "lucide-react";
import { useProps } from "@repo/ui/store";
import { Circles } from '@repo/ui/circle';
import { Rectangle } from "@repo/ui/rectangle";
import { Pencil } from "@repo/ui/pencil";
import { Select } from "@repo/ui/select";
import { Line } from "@repo/ui/line";
import { shallow } from "zustand/shallow";
import { Menu } from '@repo/ui/menu';
import { useSocket } from "@repo/ui/websocketProvider";

export default function Canva() {

    const { status } = useSession();

    useEffect(() => {
        if (status === 'authenticated') {
            return;
        }
        else {
            <LoaderIcon />
        }
    }, [status])

    const { tool, activeTool } = useProps((s) => ({ tool: s.tool, activeTool: s.activeTool }), shallow)
    const [active, setActive] = useState("select");

    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const canvasEl = useRef<HTMLCanvasElement>(null);

    const isDrawingShape = useRef(false);
    const startPoint = useRef({ x: 0, y: 0 });
    const activeShape = useRef<Rect | Circle | null>(null);
    const previewShapes = useRef<Map<string, Rect | Circle>>(new Map());
    const { socket, send } = useSocket();

    useEffect(() => {
        if (!canvasEl.current) return;
        const fabricCanvas = new Canvas(canvasEl.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#FFFFFF',
            skipOffscreen: true,
        });
        setCanvas(fabricCanvas);
        const handleResize = () => {
            fabricCanvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
            fabricCanvas.renderAll();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            fabricCanvas.dispose();
        };
    }, []);

    useEffect(() => {
        setActive(activeTool)
    }, [tool])

    const onMouseScroll = useCallback((o: TPointerEventInfo<WheelEvent>) => {

        if (!canvas) return;

        let delta = o.e.deltaY;
        let zoom = canvas.getZoom();

        zoom *= 0.99 ** delta;

        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;

        const pointer = new Point({ x: o.e.offsetX, y: o.e.offsetY })

        canvas.zoomToPoint(pointer, zoom);
        o.e.preventDefault();
        o.e.stopPropagation();

    }, [canvas])

    useEffect(() => {

        if (!canvas) return;

        canvas.on('mouse:wheel', onMouseScroll);

        return () => {
            canvas.off('mouse:wheel', onMouseScroll);
        }

    }, [canvas, onMouseScroll])

    const onMouseDown = useCallback((o: TEvent) => {
        if (!canvas) return;
        isDrawingShape.current = true;
        const pointer = canvas.getScenePoint(o.e);
        startPoint.current = { x: pointer.x, y: pointer.y };

        const shapeOptions = {
            left: startPoint.current.x, top: startPoint.current.y,
            stroke: 'black', strokeWidth: 2, fill: 'transparent',
            selectable: false,
            hasControls: false,
            rx: 20,
            ry: 20,
        };
        const shape = tool === 'rectangle'
            ? new Rect({ ...shapeOptions, width: 0, height: 0 })
            : new Circle({ ...shapeOptions, radius: 0 });

        const shapeId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        shape.set('id', shapeId);
        shape.set('isPreview', true);
        activeShape.current = shape;
        
        // Add preview shape to canvas but mark it as preview
        canvas.add(shape);
        
        // Send preview start event to other users
        send("preview:start", {
            type: tool === 'rectangle' ? 'rect' : 'circle',
            left: shape.left || 0,
            top: shape.top || 0,
            width: shape.width || 0,
            height: shape.height || 0,
            radius: tool === 'circle' ? 0 : undefined,
            stroke: shape.stroke || 'black',
            strokeWidth: shape.strokeWidth || 2,
            fill: shape.fill || 'transparent',
            id: shapeId,
            rx: 20,
            ry : 20
        });
    }, [canvas, tool, send]);

    const onMouseMove = useCallback((o: TEvent) => {
        if (!isDrawingShape.current || !activeShape.current || !canvas) return;
        const pointer = canvas.getScenePoint(o.e);
        
        if (activeShape.current.type === 'rect') {
            const rect = activeShape.current as Rect;
            if (startPoint.current.x > pointer.x) rect.set({ left: pointer.x });
            if (startPoint.current.y > pointer.y) rect.set({ top: pointer.y });
            rect.set({
                width: Math.abs(startPoint.current.x - pointer.x),
                height: Math.abs(startPoint.current.y - pointer.y),
            });
            
            // Send preview update to other users
            send("preview:move", {
                type: 'rect',
                left: rect.left || 0,
                top: rect.top || 0,
                width: rect.width || 0,
                height: rect.height || 0,
                stroke: rect.stroke || 'black',
                strokeWidth: rect.strokeWidth || 2,
                fill: rect.fill || 'transparent',
                rx: rect.rx || 20,
                ry: rect.ry || 20,
                id: rect.get('id')
            });
        }
        
        if (activeShape.current.type === 'circle') {
            const circle = activeShape.current as Circle;
            circle.set({
                left: Math.min(pointer.x, startPoint.current.x),
                top: Math.min(pointer.y, startPoint.current.y),
                radius: Math.max(Math.abs(startPoint.current.x - pointer.x), Math.abs(startPoint.current.y - pointer.y)) / 2
            });
            
            // Send preview update to other users
            send("preview:move", {
                type: 'circle',
                left: circle.left || 0,
                top: circle.top || 0,
                radius: circle.radius || 0,
                stroke: circle.stroke || 'black',
                strokeWidth: circle.strokeWidth || 2,
                fill: circle.fill || 'transparent',
                id: circle.get('id')
            });
        }
        canvas.renderAll();
    }, [canvas, send]);

    const onMouseUp = useCallback(() => {
        if (activeShape.current) {
            // Convert preview shape to permanent shape
            activeShape.current.set({ 
                hasControls: true, 
                selectable: true,
                isPreview: false 
            });

            try {
                if (activeShape.current.type === 'rect') {
                    const rect = activeShape.current as Rect;
                    send("object:added", {
                        type: 'rect',
                        left: rect.left || 0,
                        top: rect.top || 0,
                        width: rect.width || 0,
                        height: rect.height || 0,
                        stroke: rect.stroke || 'black',
                        strokeWidth: rect.strokeWidth || 2,
                        fill: rect.fill || 'transparent',
                        selectable: true,
                        hasControls: true,
                        rx: rect.rx || 20,
                        ry: rect.ry || 20,
                        id: rect.get('id')
                    });
                } else if (activeShape.current.type === 'circle') {
                    const circle = activeShape.current as Circle;
                    send("object:added", {
                        type: 'circle',
                        left: circle.left || 0,
                        top: circle.top || 0,
                        radius: circle.radius || 0,
                        stroke: circle.stroke || 'black',
                        strokeWidth: circle.strokeWidth || 2,
                        fill: circle.fill || 'transparent',
                        selectable: true,
                        hasControls: true,
                        id: circle.get('id')
                    });
                }
                
                // Send preview end event to clean up preview shapes on other clients
                send("preview:end", {
                    id: activeShape.current.get('id')
                });
            } catch (err) {
                console.log("Error sending object:", err);
            }
        }
        isDrawingShape.current = false;
        activeShape.current = null;
        canvas?.renderAll();
    }, [canvas, send]);

    // Cleanup preview shapes when switching tools
    const cleanupPreviewShapes = useCallback(() => {
        if (activeShape.current && activeShape.current.get('isPreview')) {
            // canvas?.remove(activeShape.current);
            send("preview:end", {
                id: activeShape.current.get('id')
            });
        }
        previewShapes.current.clear();
        isDrawingShape.current = false;
        activeShape.current = null;
    }, [canvas, send]);

    useEffect(() => {
        if (!canvas) return;

        // Clean up any existing preview shapes when switching tools
        // cleanupPreviewShapes();

        canvas.isDrawingMode = false;
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        canvas.hoverCursor = 'move';
        canvas.forEachObject(obj => obj.set({ selectable: true, evented: true }));

        canvas.on('object:modified', (e) => {
            const obj = e.target;
            if (obj && obj.get('id')) {
                try {
                    const payload: any = {
                        type: obj.type,
                        left: obj.left || 0,
                        top: obj.top || 0,
                        stroke: obj.stroke || 'black',
                        strokeWidth: obj.strokeWidth || 2,
                        fill: obj.fill || 'transparent',
                        selectable: true,
                        hasControls: true,
                        id: obj.get('id')
                    };

                    if (obj.type === 'rect') {
                        payload.width = obj.width || 0;
                        payload.height = obj.height || 0;
                    } else if (obj.type === 'circle') {
                        payload.radius = (obj as Circle).radius || 0;
                    }

                    send("object:modified", payload);
                } catch (err) {
                    console.log("Error sending modification:", err);
                }
            }
        });

        canvas.on('object:removed', (e) => {
            const obj = e.target;
            if (obj && obj.get('id')) {
                try {
                    send("object:deleted", {
                        type: obj.type,
                        id: obj.get('id')
                    });
                } catch (err) {
                    console.log("Error sending deletion:", err);
                }
            }
        });


        canvas.off('mouse:down', onMouseDown);
        canvas.off('mouse:move', onMouseMove);
        canvas.off('mouse:up', onMouseUp);


        switch (tool) {
            case 'select':
                canvas.defaultCursor = 'crosshair';
                canvas.hoverCursor = 'crosshair';
                break;
            case 'pencil':
                canvas.isDrawingMode = true;
                canvas.freeDrawingBrush = new PencilBrush(canvas);
                const brush = canvas.freeDrawingBrush;
                brush.width = 3;
                brush.color = '#000000';
                canvas.freeDrawingCursor = 'crosshair';

                // Add event listener for path creation
                canvas.on('path:created', (e) => {
                    const path = e.path;
                    if (path) {
                        // Add unique ID to the path
                        path.set('id', Date.now().toString() + Math.random().toString(36).substr(2, 9));
                        try {
                            send("path:added", {
                                type: 'path',
                                left: path.left || 0,
                                top: path.top || 0,
                                stroke: path.stroke || 'black',
                                strokeWidth: path.strokeWidth || 3,
                                fill: path.fill || 'transparent',
                                selectable: true,
                                hasControls: true,
                                path: (path as any).path,
                                id: path.get('id')
                            });
                        } catch (err) {
                            console.log("Error sending path:", err);
                        }
                    }
                });
                break;
            case 'rectangle':
            case 'circle':

                canvas.selection = false;
                canvas.defaultCursor = 'crosshair';
                canvas.hoverCursor = 'crosshair';
                canvas.forEachObject(obj => obj.set({ selectable: false, evented: false }));


                canvas.on('mouse:down', onMouseDown);
                canvas.on('mouse:move', onMouseMove);
                canvas.on('mouse:up', onMouseUp);
                break;
        }

        return () => {
            if (canvas) {

            }
        };
    }, [tool, canvas, onMouseDown, onMouseMove, onMouseUp]);

    useEffect(() => {
        if (!socket || socket.readyState !== WebSocket.OPEN || !canvas) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Canvas received message:", data);

                if (data.action === "object:added") {
                    const payload = data.payload;
                    if (payload.type === 'rect') {
                        const rect = new Rect({
                            left: payload.left,
                            top: payload.top,
                            width: payload.width,
                            height: payload.height,
                            stroke: payload.stroke,
                            strokeWidth: payload.strokeWidth,
                            fill: payload.fill,
                            selectable: true,
                            hasControls: true,
                            rx: payload.rx,
                            ry: payload.ry,
                        });
                        if (payload.id) rect.set('id', payload.id);
                        canvas.add(rect);
                    } else if (payload.type === 'circle') {
                        const circle = new Circle({
                            left: payload.left,
                            top: payload.top,
                            radius: payload.radius,
                            stroke: payload.stroke,
                            strokeWidth: payload.strokeWidth,
                            fill: payload.fill,
                            selectable: true,
                            hasControls: true,
                        });
                        if (payload.id) circle.set('id', payload.id);
                        canvas.add(circle);
                    } else if (payload.type === 'path') {
                        const path = new Path(payload.path, {
                            left: payload.left,
                            top: payload.top,
                            stroke: payload.stroke,
                            strokeWidth: payload.strokeWidth,
                            fill: payload.fill,
                            selectable: true,
                            hasControls: true,
                        });
                        if (payload.id) path.set('id', payload.id);
                        canvas.add(path);
                    }
                    canvas.renderAll();
                } else if (data.action === "object:modified") {
                    const payload = data.payload;
                    const objects = canvas.getObjects();
                    const targetObject = objects.find(obj => obj.get('id') === payload.id);
                    if (targetObject) {
                        targetObject.set({
                            left: payload.left,
                            top: payload.top,
                            width: payload.width,
                            height: payload.height,
                            radius: payload.radius,
                        });
                        canvas.renderAll();
                    }
                } else if (data.action === "object:deleted") {
                    const payload = data.payload;
                    const objects = canvas.getObjects();
                    const targetObject = objects.find(obj => obj.get('id') === payload.id);
                    if (targetObject) {
                        canvas.remove(targetObject);
                        canvas.renderAll();
                    }
                } else if (data.action === "preview:start") {
                    const payload = data.payload;
                    let previewShape: Rect | Circle;
                    
                    if (payload.type === 'rect') {
                        previewShape = new Rect({
                            left: payload.left,
                            top: payload.top,
                            width: payload.width,
                            height: payload.height,
                            stroke: payload.stroke,
                            strokeWidth: payload.strokeWidth,
                            fill: payload.fill,
                            selectable: false,
                            hasControls: false,
                            rx: payload.rx,
                            ry: payload.ry,
                        });
                    } else if (payload.type === 'circle') {
                        previewShape = new Circle({
                            left: payload.left,
                            top: payload.top,
                            radius: payload.radius,
                            stroke: payload.stroke,
                            strokeWidth: payload.strokeWidth,
                            fill: payload.fill,
                            selectable: false,
                            hasControls: false,
                        });
                    } else {
                        return;
                    }
                    
                    if (payload.id) {
                        previewShape.set('id', payload.id);
                        previewShape.set('isPreview', true);
                        previewShapes.current.set(payload.id, previewShape);
                        canvas.add(previewShape);
                    }
                } else if (data.action === "preview:move") {
                    const payload = data.payload;
                    const existingPreview = previewShapes.current.get(payload.id);
                    
                    if (existingPreview) {
                        if (payload.type === 'rect') {
                            (existingPreview as Rect).set({
                                left: payload.left,
                                top: payload.top,
                                width: payload.width,
                                height: payload.height,
                            });
                        } else if (payload.type === 'circle') {
                            (existingPreview as Circle).set({
                                left: payload.left,
                                top: payload.top,
                                radius: payload.radius,
                            });
                        }
                        canvas.renderAll();
                    }
                } else if (data.action === "preview:end") {
                    const payload = data.payload;
                    const previewShape = previewShapes.current.get(payload.id);
                    if (previewShape) {
                        // canvas.remove(previewShape);
                        // previewShapes.current.delete(payload.id);
                        canvas.renderAll();
                    }
                }
            } catch (error) {
                console.error("Error handling message:", error);
            }
        }

        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        }

    }, [socket, canvas])

    useEffect(() => {
        if (!canvas) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'escape') {
                const activeObjects = canvas.getActiveObjects();
                if (activeObjects.length > 0) {
                    activeObjects.forEach(obj => canvas.remove(obj));
                    canvas.discardActiveObject();
                    canvas.renderAll();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => { window.removeEventListener('keydown', handleKeyDown); };
    }, [canvas]);

    return (
        <div className="relative w-screen h-screen">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 p-0.5 bg-white border-1 border-[#E6E6E6] rounded-lg flex shadow-sm gap-2 px-1">
                <div className="grid grid-cols-5 items-center gap-1.5 px-1 ">
                    <Pencil />
                    <Rectangle />
                    <Circles />
                    <Line />
                    <Select />
                </div>
            </div>

            <div className="absolute top-1/2 z-10 -translate-y-1/2">
                <Menu />
            </div>

            <canvas ref={canvasEl} />
        </div>
    );
}