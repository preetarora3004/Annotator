-- CreateTable
CREATE TABLE "Shapes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startX" DOUBLE PRECISION NOT NULL,
    "startY" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "radius" DOUBLE PRECISION,
    "canvasId" TEXT NOT NULL,

    CONSTRAINT "Shapes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shapes" ADD CONSTRAINT "Shapes_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "Canva"("id") ON DELETE CASCADE ON UPDATE CASCADE;
