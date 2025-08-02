import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FILE_LOCATION } from "@/miscellaneous/constants";

export function AgentCombobox({ agents, assignedAgent, onSelect, disabled }:any) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-8 text-xs justify-start w-[180px]"
          disabled={disabled}
        >
          {assignedAgent ? (
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarImage
                  src={`${FILE_LOCATION}/${assignedAgent.photo}`}
                  alt={assignedAgent.name}
                />
                <AvatarFallback className="text-xs">
                  {assignedAgent.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              {assignedAgent.name}
            </div>
          ) : (
            "Select agent"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
        <Command>
          <CommandInput
            placeholder="Search agents..."
            className="h-8 text-xs"
          />
          <CommandEmpty>No agent found.</CommandEmpty>
          <CommandGroup>
            {agents.map((agent:any) => (
              <CommandItem
                key={agent.id}
                value={agent.name}
                onSelect={() => {
                  onSelect(agent.id.toString());
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarImage
                      src={`${FILE_LOCATION}/${agent.photo}`}
                      alt={agent.name}
                    />
                    <AvatarFallback className="text-xs">
                      {agent.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{agent.name}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
