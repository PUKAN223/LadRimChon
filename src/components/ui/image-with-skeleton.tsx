'use client'

import { useCallback, useState, type ImgHTMLAttributes } from 'react'

interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName: string
  fallbackSrc?: string
}

export function ImageWithSkeleton({
  wrapperClassName,
  fallbackSrc,
  className,
  src,
  alt,
  onLoad,
  onError,
  style,
  ...props
}: ImageWithSkeletonProps) {
  const [imageState, setImageState] = useState(() => ({ source: src, currentSrc: src, isLoaded: false }))
  const isCurrentSource = imageState.source === src
  const currentSrc = isCurrentSource ? imageState.currentSrc : src
  const isLoaded = isCurrentSource && imageState.isLoaded
  const markCachedImageAsLoaded = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth > 0) {
      setImageState({ source: src, currentSrc, isLoaded: true })
    }
  }, [currentSrc, src])

  return (
    <span className={`image-skeleton ${wrapperClassName}`}>
      {!isLoaded && <span aria-hidden="true" className="image-skeleton-shimmer" />}
      <img
        {...props}
        ref={markCachedImageAsLoaded}
        src={currentSrc}
        alt={alt}
        className={`relative z-0 h-full w-full transition-opacity duration-200 ${className ?? ''}`}
        style={isLoaded ? style : { ...style, opacity: 0 }}
        onLoad={(event) => {
          setImageState({ source: src, currentSrc, isLoaded: true })
          onLoad?.(event)
        }}
        onError={(event) => {
          if (fallbackSrc && currentSrc !== fallbackSrc) {
            setImageState({ source: src, currentSrc: fallbackSrc, isLoaded: false })
            return
          }
          setImageState({ source: src, currentSrc, isLoaded: true })
          onError?.(event)
        }}
      />
    </span>
  )
}
