import React, {useState} from 'react';
import {Stepper, Step} from '@astryxdesign/core/Stepper';
import {Button} from '@astryxdesign/core/Button';
import {Stack} from '@astryxdesign/core/Stack';
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

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto p-6">
      <Stepper activeStep={activeStep}>
        {steps.map(label => <Step key={label} label={label} />)}
      </Stepper>

      <div className="min-h-[200px]">
        {activeStep === 0 && (
          <div className="flex flex-col gap-4">
            <Heading level={4}>Personal Information</Heading>
            <TextInput label="Full name" value={name} onChange={setName} isRequired />
            <TextInput label="Email" type="email" value={email} onChange={setEmail} isRequired />
          </div>
        )}
        {activeStep === 1 && (
          <div className="flex flex-col gap-4">
            <Heading level={4}>Preferences</Heading>
            <Selector label="Role" options={['Designer', 'Developer', 'PM', 'Other']} value={role} onChange={setRole} />
          </div>
        )}
        {activeStep === 2 && (
          <div className="flex flex-col gap-4">
            <Heading level={4}>Review</Heading>
            <Text>Name: {name || '(not provided)'}</Text>
            <Text>Email: {email || '(not provided)'}</Text>
            <Text>Role: {role || '(not selected)'}</Text>
          </div>
        )}
      </div>

      <Stack gap={2} justify="end">
        <Button label="Back" variant="secondary" onClick={() => setActiveStep(s => s - 1)} isDisabled={activeStep === 0} />
        {activeStep < steps.length - 1
          ? <Button label="Next" variant="primary" onClick={() => setActiveStep(s => s + 1)} />
          : <Button label="Submit" variant="primary" onClick={() => alert('Submitted!')} />
        }
      </Stack>
    </div>
  );
}
