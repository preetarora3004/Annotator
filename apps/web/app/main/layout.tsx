import { WebSocketProvider } from "@repo/ui/websocketProvider"

export default function userLayout({children } : {children : React.ReactNode}){
    return (
        <div className="user-layout">
            <WebSocketProvider>
                {children}
            </WebSocketProvider>
        </div>
    )
}