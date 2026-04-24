import { Modal } from '@/components/common/Modal';

export function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="上傳（尚未實作）" onClose={onClose}>
      <p>將於下一個 task 完成</p>
    </Modal>
  );
}
