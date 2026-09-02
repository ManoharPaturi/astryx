import React, {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
import {VStack} from '@astryxdesign/core/VStack';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const steps = ['Personal Info', 'Preferences', 'Review'];

export default function FormWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <VStack gap={4}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label} label={label} />
        ))}
      </Stepper>

      <div>
        {activeStep === 0 && (
          <VStack gap={3}>
            <Heading level={4}>Personal Information</Heading>
            <TextInput label="Full name" value={name} onChange={setName} isRequired />
            <TextInput label="Email address" type="email" value={email} onChange={setEmail} isRequired />
          </VStack>
        )}

        {activeStep === 1 && (
          <VStack gap={3}>
            <Heading level={4}>Preferences</Heading>
            <Selector
              label="Role"
              options={['Designer', 'Developer', 'Product Manager', 'Other']}
              value={role}
              onChange={setRole}
            />
          </VStack>
        )}

        {activeStep === 2 && (
          <VStack gap={3}>
            <Heading level={4}>Review</Heading>
            <Text>Name: {name || '(not provided)'}</Text>
            <Text>Email: {email || '(not provided)'}</Text>
            <Text>Role: {role || '(not selected)'}</Text>
          </VStack>
        )}
      </div>

      <Stack gap={2} justify="end">
        <Button
          label="Back"
          variant="secondary"
          onClick={handleBack}
          isDisabled={activeStep === 0}
        />
        {activeStep < steps.length - 1 ? (
          <Button label="Next" variant="primary" onClick={handleNext} />
        ) : (
          <Button label="Submit" variant="primary" onClick={() => alert('Submitted!')} />
        )}
      </Stack>
    </VStack>
  );
}
