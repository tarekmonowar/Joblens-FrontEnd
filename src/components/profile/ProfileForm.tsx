'use client';

// Career profile editor — skills, experience, roles; prefilled from useMe.

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useMe, useUpdateProfile } from '@/hooks/useProfile';
import { toastFormErrors } from '@/hooks/useAuth';

const profileSchema = z.object({
  skillsText: z.string(),
  experienceYears: z.number().min(0, 'Must be 0 or more').max(50),
  currentRole: z.string().optional(),
  targetRole: z.string().optional(),
  preferredLocation: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

/** Comma-separated skills → normalized array for the API. */
function parseSkills(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Editable career profile — saves via PATCH /users/me/profile.
 */
export function ProfileForm() {
  const { data: me, isPending, isError, error, refetch } = useMe();
  const updateMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      skillsText: '',
      experienceYears: 0,
      currentRole: '',
      targetRole: '',
      preferredLocation: '',
    },
  });

  // Prefill from server profile when loaded
  useEffect(() => {
    if (me?.profile) {
      reset({
        skillsText: me.profile.skills.join(', '),
        experienceYears: me.profile.experienceYears,
        currentRole: me.profile.currentRole ?? '',
        targetRole: me.profile.targetRole ?? '',
        preferredLocation: me.profile.preferredLocation ?? '',
      });
    } else if (me) {
      reset({
        skillsText: '',
        experienceYears: 0,
        currentRole: '',
        targetRole: '',
        preferredLocation: '',
      });
    }
  }, [me, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    await updateMutation.mutateAsync({
      skills: parseSkills(values.skillsText),
      experienceYears: values.experienceYears,
      currentRole: values.currentRole?.trim() || null,
      targetRole: values.targetRole?.trim() || null,
      preferredLocation: values.preferredLocation?.trim() || null,
    });
  };

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-28" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Career profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message={error?.message ?? 'Could not load your profile'}
            onRetry={() => void refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Career profile</CardTitle>
        {me && (
          <p className="text-sm text-muted-foreground">
            {me.name} · {me.email}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(onSubmit, toastFormErrors)(e);
          }}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              placeholder="React, Node.js, TypeScript"
              disabled={updateMutation.isPending}
              {...register('skillsText')}
            />
            <p className="text-xs text-muted-foreground">Comma-separated list</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of experience</Label>
            <Input
              id="experience"
              type="number"
              min={0}
              max={50}
              disabled={updateMutation.isPending}
              {...register('experienceYears', {
                valueAsNumber: true,
              })}
            />
            {errors.experienceYears && (
              <p className="text-sm text-destructive">{errors.experienceYears.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currentRole">Current role</Label>
              <Input
                id="currentRole"
                placeholder="e.g. Frontend Developer"
                disabled={updateMutation.isPending}
                {...register('currentRole')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target role</Label>
              <Input
                id="targetRole"
                placeholder="e.g. Fullstack Engineer"
                disabled={updateMutation.isPending}
                {...register('targetRole')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredLocation">Preferred location</Label>
            <Input
              id="preferredLocation"
              placeholder="e.g. Dhaka, Remote"
              disabled={updateMutation.isPending}
              {...register('preferredLocation')}
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending || !isDirty}>
            {updateMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
