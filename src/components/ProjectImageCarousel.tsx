'use client';
import type { PreviewImage } from '@/lib/preview-api';
import { cn } from '@/utils/cn';
import { useEffect, useState } from 'react';

const AUTO_ADVANCE_MS = 3500;

export default function ProjectImageCarousel({
	images,
	fallbackUrl,
	title,
}: {
	images?: PreviewImage[];
	fallbackUrl: string;
	title: string;
}) {
	const slides = images && images.length > 1 ? images : null;
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);

	useEffect(() => {
		if (!slides || paused) return;
		const id = setInterval(() => {
			setIndex(i => (i + 1) % slides.length);
		}, AUTO_ADVANCE_MS);
		return () => clearInterval(id);
	}, [slides, paused]);

	if (!slides) {
		return (
			<img
				src={fallbackUrl}
				alt={title}
				loading='lazy'
				className='aspect-[1200/630] w-full bg-neutral-900 object-contain'
			/>
		);
	}

	return (
		<div
			className='relative aspect-[1200/630] w-full overflow-hidden bg-neutral-900'
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
		>
			{slides.map((img, i) => (
				<img
					key={img.url}
					src={img.url}
					alt={img.alt || title}
					loading='lazy'
					className={cn(
						'absolute inset-0 h-full w-full object-contain transition-opacity duration-500',
						i === index ? 'opacity-100' : 'opacity-0',
					)}
				/>
			))}

			<div className='absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5'>
				{slides.map((img, i) => (
					<button
						key={img.url}
						type='button'
						onClick={e => {
							e.preventDefault();
							setIndex(i);
						}}
						aria-label={`Ver imagen ${i + 1} de ${slides.length}`}
						className={cn(
							'h-1.5 rounded-full transition-all',
							i === index
								? 'w-5 bg-white'
								: 'w-1.5 bg-white/50 hover:bg-white/75',
						)}
					/>
				))}
			</div>
		</div>
	);
}
