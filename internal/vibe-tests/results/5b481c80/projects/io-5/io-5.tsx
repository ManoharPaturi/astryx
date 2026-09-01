import {useState} from 'react';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const priorityOptions = [
  {value: 'low', label: 'Low'},
  {value: 'medium', label: 'Medium'},
  {value: 'high', label: 'High'},
  {value: 'critical', label: 'Critical'},
];

const MAX_DESCRIPTION_LENGTH = 1000;

export default function SupportTicketForm() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/tickets', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({subject, description, priority}),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VStack gap={4} padding={4} maxWidth={600}>
      <Heading level={2}>Submit a Support Ticket</Heading>

      <TextInput
        label="Subject"
        value={subject}
        onChange={setSubject}
        placeholder="Brief summary of the issue"
        isRequired
      />

      <VStack gap={1}>
        <TextArea
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Describe your issue in detail..."
          maxLength={MAX_DESCRIPTION_LENGTH}
          isRequired
        />
        <Text type="supporting" color="secondary">
          {description.length}/{MAX_DESCRIPTION_LENGTH} characters
        </Text>
      </VStack>

      <Selector
        label="Priority"
        value={priority}
        onChange={setPriority}
        options={priorityOptions}
        placeholder="Select priority level"
        isRequired
      />

      <Button
        label="Submit Ticket"
        variant="primary"
        onClick={handleSubmit}
        isLoading={isSubmitting}
        isDisabled={!subject || !description || !priority}
      />
    </VStack>
  );
}
