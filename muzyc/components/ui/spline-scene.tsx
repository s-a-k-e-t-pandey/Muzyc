'use client'

import { Suspense, lazy, useEffect, useRef } from 'react'
import type { Application } from '@splinetool/runtime';
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  mousePosition?: { x: number; y: number }
}

export function SplineScene({ scene, className, mousePosition }: SplineSceneProps) {
  const splineRef = useRef<Application>();

  const onLoad = (splineApp: Application) => {
    splineRef.current = splineApp;
  };

  useEffect(() => {
    if (splineRef.current && mousePosition) {
      // Rotate the scene based on mouse position
      const rotationX = mousePosition.y * 0.1; // Reduced multiplier for subtler effect
      const rotationY = mousePosition.x * 0.1;
      
      // Get the scene root object
      const obj = splineRef.current.findObjectByName('Scene');
      if (obj) {
        obj.rotation.x = rotationX;
        obj.rotation.y = rotationY;
      }
    }
  }, [mousePosition]);

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-linear-to-t from-sky-500 to-indigo-500">
          <div className="flex space-x-2 justify-center items-center">
            <div className="h-8 w-8 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-8 w-8 bg-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-8 w-8 bg-purple-600 rounded-full animate-bounce"></div>
          </div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        onLoad={onLoad}
      />
    </Suspense>
  )
}