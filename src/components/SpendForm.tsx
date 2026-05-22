'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuditInputSchema, AuditInputType } from '@/lib/schemas';
import { PRICING_DATA } from '@/lib/pricing';
import { PrimaryUseCase, ToolName, SpendInputItem } from '@/types/audit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, HelpCircle, ArrowRight, Activity } from 'lucide-react';

const USE_CASES = [
  { id: 'coding', label: 'Software Engineering / Coding' },
  { id: 'writing', label: 'Content Writing / Marketing' },
  { id: 'data', label: 'Data Analysis & BI' },
  { id: 'research', label: 'Market Research & Strategy' },
  { id: 'mixed', label: 'Mixed / General Purpose' },
];

const TOOLS_LIST = Object.values(PRICING_DATA);

interface SpendFormProps {
  onSubmit: (data: AuditInputType) => void;
  isLoading?: boolean;
}

export function SpendForm({ onSubmit, isLoading = false }: SpendFormProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [selectedToolToAdd, setSelectedToolToAdd] = React.useState<ToolName>('cursor');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AuditInputType>({
    resolver: zodResolver(AuditInputSchema),
    defaultValues: {
      teamSize: 1,
      primaryUseCase: 'coding',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');
  const watchTeamSize = watch('teamSize');

  // SSR hydration safety
  React.useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('spendoptic_audit_form');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch (e) {
        console.error('Failed to parse saved form state', e);
      }
    }
  }, [reset]);

  // Persist form changes
  React.useEffect(() => {
    if (!isMounted) return;
    const subscription = watch((value) => {
      localStorage.setItem('spendoptic_audit_form', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, isMounted]);

  if (!isMounted) {
    return (
      <div className="w-full flex items-center justify-center p-12 text-slate-400">
        <Activity className="h-6 w-6 animate-spin text-indigo-500 mr-2" />
        <span>Loading spend engine workspace...</span>
      </div>
    );
  }

  const activeTools = new Set(fields.map((item) => item.toolId));

  const handleAddTool = () => {
    if (activeTools.has(selectedToolToAdd)) return;

    const tool = PRICING_DATA[selectedToolToAdd];
    const defaultPlan = tool.plans[0]?.id || '';
    const isApi = tool.plans[0]?.isApi || false;
    const defaultPrice = tool.plans[0]?.pricePerSeat || 0;

    const newItem: SpendInputItem = {
      toolId: selectedToolToAdd,
      planId: defaultPlan,
      seats: isApi ? 0 : watchTeamSize || 1,
      monthlySpend: isApi ? 50 : defaultPrice * (watchTeamSize || 1),
    };

    append(newItem);

    // Pick another tool not added yet for convenience
    const remaining = TOOLS_LIST.find((t) => !activeTools.has(t.id) && t.id !== selectedToolToAdd);
    if (remaining) {
      setSelectedToolToAdd(remaining.id);
    }
  };

  const handlePlanChange = (index: number, planId: string) => {
    const item = watchItems[index];
    if (!item) return;

    const tool = PRICING_DATA[item.toolId];
    const plan = tool.plans.find((p) => p.id === planId);
    if (!plan) return;

    setValue(`items.${index}.planId`, planId);
    
    if (plan.isApi) {
      setValue(`items.${index}.seats`, 0);
      // Give a sensible default for API spend if it was calculated from seat subscriptions
      if (item.monthlySpend === 0 || item.seats > 0) {
        setValue(`items.${index}.monthlySpend`, 100);
      }
    } else {
      const seats = item.seats === 0 ? watchTeamSize || 1 : item.seats;
      setValue(`items.${index}.seats`, seats);
      setValue(`items.${index}.monthlySpend`, plan.pricePerSeat * seats);
    }
  };

  const handleSeatsChange = (index: number, seats: number) => {
    const item = watchItems[index];
    if (!item) return;

    const tool = PRICING_DATA[item.toolId];
    const plan = tool.plans.find((p) => p.id === item.planId);
    if (!plan || plan.isApi) return;

    setValue(`items.${index}.seats`, seats);
    setValue(`items.${index}.monthlySpend`, plan.pricePerSeat * seats);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-fade-in">
      <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <span className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg mr-3">1</span>
            Startup Attributes
          </CardTitle>
          <CardDescription>Configure your core team parameters to calibrate optimal recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center">
              Active Team Size
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <Input
              type="number"
              min={1}
              {...register('teamSize', { valueAsNumber: true })}
              placeholder="e.g. 5"
              className={errors.teamSize ? 'border-rose-500' : ''}
            />
            {errors.teamSize && (
              <p className="text-xs text-rose-500 mt-1">{errors.teamSize.message}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Primary Use Case
              <span className="text-rose-500 ml-1">*</span>
            </label>
            <select
              {...register('primaryUseCase')}
              className="flex h-10 w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {USE_CASES.map((uc) => (
                <option key={uc.id} value={uc.id} className="bg-slate-950 text-white">
                  {uc.label}
                </option>
              ))}
            </select>
            {errors.primaryUseCase && (
              <p className="text-xs text-rose-500 mt-1">{errors.primaryUseCase.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tool Input Card */}
      <Card className="border border-white/10 bg-slate-900/40 backdrop-blur-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-white text-lg flex items-center">
              <span className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg mr-3">2</span>
              AI Tools & Subscriptions
            </CardTitle>
            <CardDescription className="mt-1">Add all AI subscriptions, licenses, and direct API tools you pay for.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add tool panel */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="flex-1">
              <select
                value={selectedToolToAdd}
                onChange={(e) => setSelectedToolToAdd(e.target.value as ToolName)}
                className="flex h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {TOOLS_LIST.map((t) => (
                  <option
                    key={t.id}
                    value={t.id}
                    disabled={activeTools.has(t.id)}
                    className="bg-slate-950 text-white disabled:text-slate-600"
                  >
                    {t.name} {activeTools.has(t.id) ? '(Added)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              onClick={handleAddTool}
              variant="outline"
              className="flex items-center"
              disabled={activeTools.size === TOOLS_LIST.length}
            >
              <Plus className="h-4 w-4 mr-2" /> Add AI Tool
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-slate-950/20">
              <HelpCircle className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">No AI Tools Added Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Add Cursor, Claude, ChatGPT, or developer APIs above to calculate your exact monthly overspend and savings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const item = watchItems[index];
                if (!item) return null;

                const tool = PRICING_DATA[item.toolId];
                const activePlan = tool.plans.find((p) => p.id === item.planId);
                const isApi = activePlan?.isApi || false;

                return (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-950/40 border border-white/5 p-4 rounded-xl relative hover:border-white/10 transition-all group"
                  >
                    {/* Tool Name */}
                    <div className="md:col-span-3 flex flex-col space-y-1">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tool</span>
                      <span className="font-bold text-white text-base">{tool.name}</span>
                    </div>

                    {/* Plan selection */}
                    <div className="md:col-span-3 flex flex-col space-y-1.5">
                      <label className="text-xs text-slate-400">Subscription Plan</label>
                      <select
                        value={item.planId}
                        onChange={(e) => handlePlanChange(index, e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                      >
                        {tool.plans.map((p) => (
                          <option key={p.id} value={p.id} className="bg-slate-950 text-white">
                            {p.name} {p.pricePerSeat > 0 ? `($${p.pricePerSeat}/mo)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Seats selection */}
                    <div className="md:col-span-2 flex flex-col space-y-1.5">
                      <label className="text-xs text-slate-400">
                        {isApi ? 'Seats (API N/A)' : 'Seats / Licenses'}
                      </label>
                      <Input
                        type="number"
                        min={1}
                        disabled={isApi}
                        value={isApi ? '' : item.seats}
                        onChange={(e) => handleSeatsChange(index, parseInt(e.target.value) || 0)}
                        placeholder="Seats"
                        className="disabled:opacity-40"
                      />
                    </div>

                    {/* Cost inputs */}
                    <div className="md:col-span-3 flex flex-col space-y-1.5">
                      <label className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Monthly Spend ($)</span>
                        {!isApi && <span className="text-[10px] text-slate-500">(Auto)</span>}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        {...register(`items.${index}.monthlySpend` as const, {
                          valueAsNumber: true,
                        })}
                        placeholder="Spend / mo"
                      />
                    </div>

                    {/* Remove button */}
                    <div className="md:col-span-1 flex items-center justify-end h-10">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                        title="Remove Tool"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {errors.items && (
            <p className="text-sm text-rose-500 text-center font-medium mt-4">
              {errors.items.message}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Form Submission */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="premium"
          size="lg"
          className="w-full sm:w-auto shadow-lg hover:shadow-indigo-500/25 active:scale-95"
          disabled={isLoading || fields.length === 0}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Activity className="h-5 w-5 animate-spin mr-2" /> Auditing AI stack...
            </span>
          ) : (
            <span className="flex items-center font-semibold">
              Analyze AI Spend & Optimize <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
