"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  lectureId: string;
  onComplete: () => void;
};

export function QuestionForm({ lectureId, onComplete }: Props) {
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');

  // Minimal placeholder UI; replace with real implementation later
  return (
    <div className="space-y-4">
      <div>
        <Label>Lecture</Label>
        <div className="text-sm text-muted-foreground">{lectureId}</div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="q-text">Question</Label>
        <Textarea id="q-text" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="q-answer">Answer</Label>
        <Input id="q-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={() => onComplete()}>Close</Button>
        <Button type="button" onClick={() => onComplete()}>Save</Button>
      </div>
    </div>
  );
}
