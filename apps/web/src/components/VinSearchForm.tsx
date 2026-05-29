import { FormEvent, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoVins, isValidVin } from "@/lib/api";

interface VinSearchFormProps {
  isLoading: boolean;
  onSubmit: (vin: string) => void;
}

export function VinSearchForm({ isLoading, onSubmit }: VinSearchFormProps) {
  const [vin, setVin] = useState("1HGCM82633A004352");
  const [error, setError] = useState<string | null>(null);

  function submit(nextVin = vin) {
    const normalized = nextVin.trim().toUpperCase();
    if (!isValidVin(normalized)) {
      setError("Enter a 17-character VIN using allowed VIN characters.");
      return;
    }
    setError(null);
    setVin(normalized);
    onSubmit(normalized);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit();
  }

  function chooseDemoVin(nextVin: string) {
    setVin(nextVin);
    submit(nextVin);
  }

  return (
    <form onSubmit={handleSubmit} className="industrial-panel reveal-in p-5">
      <div className="flex flex-col gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="vin">Vehicle Identification Number</Label>
          <Input
            id="vin"
            value={vin}
            onChange={(event) => {
              setVin(event.target.value);
              setError(null);
            }}
            placeholder="1HGCM82633A004352"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "vin-error" : "vin-help"}
            className="mono-value h-11 uppercase"
          />
          {error ? (
            <p id="vin-error" className="text-sm text-destructive">
              {error}
            </p>
          ) : (
            <p id="vin-help" className="text-sm text-muted-foreground">
              Search across mocked Sales and Service document systems.
            </p>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
          {isLoading ? "Searching" : "Search"}
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Demo VINs">
        {demoVins.map((demo) => (
          <Button key={demo.vin} type="button" variant="outline" size="sm" onClick={() => chooseDemoVin(demo.vin)}>
            {demo.label}
          </Button>
        ))}
      </div>
    </form>
  );
}
