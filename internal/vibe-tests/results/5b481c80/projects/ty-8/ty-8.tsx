import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/VStack';

export default function ProfileCard() {
  return (
    <Card padding={4} maxWidth={400}>
      <VStack gap={2}>
        <Heading level={3}>Sarah Chen</Heading>
        <Text type="label" color="secondary">Senior Product Designer</Text>
        <Text>
          Passionate about crafting intuitive user experiences that bridge the gap
          between complex systems and everyday users. 8 years of experience
          in design systems, interaction design, and user research.
        </Text>
        <Text type="supporting" color="secondary">Joined March 2022</Text>
      </VStack>
    </Card>
  );
}
