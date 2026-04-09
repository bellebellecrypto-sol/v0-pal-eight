"use client";

import { useCases, type UseCase } from "@/lib/colors";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useHaptics } from "@/hooks/use-native";

interface UseCaseSelectorProps {
  selectedUseCase: UseCase;
  onSelect: (useCase: UseCase) => void;
}

export function UseCaseSelector({ selectedUseCase, onSelect }: UseCaseSelectorProps) {
  const { selection } = useHaptics();

  const handleSelect = async (useCase: UseCase) => {
    await selection();
    onSelect(useCase);
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {useCases.map((useCase) => {
        const isSelected = selectedUseCase === useCase.id;
        
        return (
          <button
            key={useCase.id}
            onClick={() => handleSelect(useCase.id)}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-center",
              "border-2 transition-all duration-200",
              "active:scale-[0.96]",
              isSelected
                ? "border-primary/30 bg-primary/5"
                : "border-transparent bg-card"
            )}
          >
            {/* Selection glow effect */}
            {isSelected && (
              <div 
                className="absolute inset-0 rounded-2xl opacity-50 animate-scale-in"
                style={{
                  background: `radial-gradient(circle at center, ${useCase.gradient[0]}15 0%, transparent 70%)`,
                }}
              />
            )}

            {/* Gradient icon background with lift effect */}
            <div 
              className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-xl text-base transition-all duration-200",
                isSelected 
                  ? "shadow-md -translate-y-0.5" 
                  : "bg-secondary/60"
              )}
              style={isSelected ? {
                background: `linear-gradient(135deg, ${useCase.gradient[0]}, ${useCase.gradient[1]})`,
                color: "white",
              } : undefined}
            >
              {useCase.icon}
              
              {/* Checkmark badge with spring pop */}
              {isSelected && (
                <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm animate-spring-pop">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </div>
              )}
            </div>
            
            {/* Label */}
            <span 
              className={cn(
                "relative text-[11px] font-semibold tracking-tight transition-colors duration-200",
                isSelected ? "text-foreground" : "text-foreground/70"
              )}
            >
              {useCase.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
