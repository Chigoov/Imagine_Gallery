import React from 'react';
import { Modal, ModalProps } from './Modal';

export type BottomSheetProps = Omit<ModalProps, 'maxWidth' | 'variant'>;
export const BottomSheet: React.FC<BottomSheetProps> = (props) => <Modal {...props} maxWidth="max-w-md" variant="sheet" />;
