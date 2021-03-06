import { useContext } from 'react';
import { useModal, Modal, Button, Text, useToasts } from '@zeit-ui/react';
import { Save } from '@zeit-ui/react-icons';
import { useRouter } from 'next/router';

import { SprintDataContext } from '@utils/ctx/SprintDataContext';
import { completedStoryPoints } from '@utils/sprintMetrics';

const SavePresentation = () => {
  const { setVisible, bindings } = useModal();
  const { user, tasks, currentSprint, assignees } = useContext(
    SprintDataContext,
  );
  const [, setToast] = useToasts();
  const router = useRouter();

  const savePresentation = () => {
    const { stories, bugs, others } = tasks;
    const achievement = completedStoryPoints(stories, bugs, others);

    fetch(`/api/sprints/${currentSprint.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        sprint: { data: { tasks, user, assignees }, achievement },
      }),
    }).then(res => {
      if (res.ok) {
        setToast({
          text: 'Successfully saved the Presentation!',
          type: 'success',
        });
        setTimeout(() => router.reload(), 1000);
      } else {
        setToast({
          text: 'Successfully updated the Forecast!',
          type: 'error',
        });
      }
      setVisible(false);
    });
  };

  return (
    <>
      <Button
        style={{
          zIndex: 100,
          position: 'absolute',
          right: '20px',
          bottom: '20px',
        }}
        auto
        onClick={() => setVisible(true)}
        iconRight={<Save />}
      >
        Save
      </Button>
      <Modal {...bindings}>
        <Modal.Title>Do you really want to save the presentation?</Modal.Title>
        <Modal.Content>
          If you want to save the presentation as is you will be saved as its
          presenter.
          <Text type="error">
            <Text b>Warning:</Text> you won&apos;t be able to change it anymore.
          </Text>
        </Modal.Content>
        <Modal.Action passive onClick={() => setVisible(false)}>
          Cancel
        </Modal.Action>
        <Modal.Action onClick={() => savePresentation()}>Submit</Modal.Action>
      </Modal>
    </>
  );
};

export default SavePresentation;
