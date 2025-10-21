"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  name: string;
  provider: string;
  tier: string;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  trigger?: React.ReactNode;
}

const AVAILABLE_MODELS: Model[] = [
  { id: "z-ai/glm-4.5-air:free", name: "GLM-4.5 Air", provider: "Z-AI", tier: "free" },
  { id: "alibaba/tongyi-deepresearch-30b-a3b:free", name: "Tongyi DeepResearch 30B", provider: "Alibaba", tier: "free" },
  { id: "meituan/longcat-flash-chat:free", name: "LongCat Flash Chat", provider: "Meituan", tier: "free" },
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B v2", provider: "NVIDIA", tier: "free" },
  { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B", provider: "OpenAI", tier: "free" },
  { id: "moonshotai/kimi-k2:free", name: "Kimi K2", provider: "Moonshot AI", tier: "free" },
  { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder", provider: "Qwen", tier: "free" },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Dolphin Mistral 24B", provider: "Cognitive Computations", tier: "free" },
  { id: "google/gemma-3n-e2b-it:free", name: "Gemma 3N E2B IT", provider: "Google", tier: "free" },
  { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small 3.2 24B", provider: "Mistral AI", tier: "free" },
  { id: "mistralai/devstral-small-2505:free", name: "Devstral Small 2505", provider: "Mistral AI", tier: "free" },
  { id: "meta-llama/llama-3.3-8b-instruct:free", name: "Llama 3.3 8B", provider: "Meta", tier: "free" },
  { id: "qwen/qwen3-4b:free", name: "Qwen3 4B", provider: "Qwen", tier: "free" },
  { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick", provider: "Meta", tier: "free" },
  { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout", provider: "Meta", tier: "free" },
  { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek Chat V3", provider: "DeepSeek", tier: "free" },
];

export function ModelSelector({ selectedModel, onModelSelect, trigger }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = AVAILABLE_MODELS.find(model => model.id === selectedModel);

  const handleModelSelect = (modelId: string) => {
    onModelSelect(modelId);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <span className="truncate max-w-[150px]">
              {currentModel?.name || "Select Model"}
            </span>
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm max-h-[65vh]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">Select AI Model</DialogTitle>
          <DialogDescription className="text-sm">
            Choose from available models below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 max-h-[50vh] overflow-y-auto scrollbar-hide border-0">
          {AVAILABLE_MODELS.map((model) => (
            <Button
              key={model.id}
              variant="ghost"
              className={cn(
                "justify-between h-auto py-2 px-2 text-left transition-all duration-200 hover:bg-muted/50 border-0 focus:ring-0",
                selectedModel === model.id && "border-l-4 border-primary bg-muted/30"
              )}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate flex-1 min-w-0">{model.name}</span>
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {model.provider}
                </span>
              </div>
              {selectedModel === model.id && (
                <CheckIcon className="h-4 w-4" />
              )}
            </Button>
          ))}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
