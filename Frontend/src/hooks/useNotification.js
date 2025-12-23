import { useNotification as useNotificationContext } from '../context/NotificationContext';

// Re-export for convenience
export const useNotification = useNotificationContext;

// Additional notification hooks
export const useToast = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotificationContext();
  
  return {
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo
  };
};

export const useConfirmation = () => {
  const { addNotification } = useNotificationContext();
  
  const confirm = (message, onConfirm, onCancel) => {
    addNotification({
      type: 'confirmation',
      message,
      duration: 0, // Don't auto-dismiss
      actions: [
        {
          label: 'Cancel',
          onClick: onCancel,
          variant: 'secondary'
        },
        {
          label: 'Confirm',
          onClick: onConfirm,
          variant: 'danger'
        }
      ]
    });
  };
  
  return { confirm };
};