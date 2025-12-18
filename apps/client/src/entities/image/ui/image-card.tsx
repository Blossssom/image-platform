import React from 'react';
import Image from 'next/image';

interface Props {
  imageSrc: string;
}

export default function ImageCard({ imageSrc }: Props) {
  return (
    <div>
      <Image src={imageSrc} alt="Image" width={200} height={200} />
    </div>
  );
}
