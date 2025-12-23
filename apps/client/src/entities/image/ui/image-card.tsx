import React, { ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardFooter } from '@/shared/ui/card';

interface Props {
  imageSrc: string;
  actionSlot?: ReactNode;
}

export default function ImageCard({ imageSrc, actionSlot }: Props) {
  return (
    <Card>
      <Image src={imageSrc} alt="Image" width={200} height={200} />
      {actionSlot && <CardFooter>{actionSlot}</CardFooter>}
    </Card>
  );
}
