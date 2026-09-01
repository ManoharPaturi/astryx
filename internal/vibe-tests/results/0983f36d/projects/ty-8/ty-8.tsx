import {Card, CardContent} from '@/components/ui/card';

export default function ProfileCard() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardContent className="space-y-2 pt-6">
          <h3 className="text-xl font-semibold">Sarah Chen</h3>
          <p className="text-sm font-medium text-muted-foreground">Senior Product Designer</p>
          <p className="text-sm">
            Passionate about crafting intuitive user experiences that bridge the gap
            between complex systems and everyday users. 8 years of experience
            in design systems, interaction design, and user research.
          </p>
          <p className="text-xs text-muted-foreground">Joined March 2022</p>
        </CardContent>
      </Card>
    </div>
  );
}
