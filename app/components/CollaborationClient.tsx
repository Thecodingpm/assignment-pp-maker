'use client';
import * as React from 'react';
import * as Y from 'yjs';
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin';

type ProviderFactory = (id: string, yjsDocMap: Map<string, Y.Doc>) => any;

export default function CollaborationClient({
  id,
  providerFactory,
  shouldBootstrap = true,
}: {
  id: string;
  providerFactory: ProviderFactory;
  shouldBootstrap?: boolean;
}) {
  return (
    <CollaborationPlugin
      id={id}
      providerFactory={providerFactory}
      shouldBootstrap={shouldBootstrap}
    />
  );
}

