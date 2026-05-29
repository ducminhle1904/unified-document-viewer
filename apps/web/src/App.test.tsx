import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { completeResponse, emptyResponse, partialResponse } from "./test/fixtures";

function mockFetch(response: unknown, ok = true, status = ok ? 200 : 500) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok,
    status,
    json: async () => response
  } as Response);
}

describe("Unified Document Viewer UI", () => {
  it("validates VIN input before submitting", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<App />);

    await user.clear(screen.getByLabelText(/vehicle identification number/i));
    await user.type(screen.getByLabelText(/vehicle identification number/i), "bad-vin");
    await user.click(screen.getByRole("button", { name: /^search$/i }));

    expect(await screen.findByText(/enter a 17-character vin/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("demo VIN selection submits and renders complete documents", async () => {
    const user = userEvent.setup();
    mockFetch(completeResponse);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Complete" }));

    expect(await screen.findAllByText("Vehicle sales contract")).not.toHaveLength(0);
    expect(screen.getAllByText("12 month service invoice")).not.toHaveLength(0);
    expect(screen.getAllByText("Sales System")).not.toHaveLength(0);
    expect(screen.getAllByText("Service System")).not.toHaveLength(0);
    expect(screen.getByText("Deduped normalized IDs")).toBeInTheDocument();
    expect(screen.getByText("15 Jan 2026")).toBeInTheDocument();
    expect(screen.getAllByText("SERVICE INVOICE")).not.toHaveLength(0);
    expect(screen.getAllByText("SALES CONTRACT")).not.toHaveLength(0);
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining("/api/vehicles/1HGCM82633A004352/documents"));
  });

  it("renders empty results", async () => {
    const user = userEvent.setup();
    mockFetch(emptyResponse);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Empty" }));

    expect(await screen.findByText("No documents found")).toBeInTheDocument();
    expect(screen.getByText(/both source systems completed the search/i)).toBeInTheDocument();
    expect(screen.queryByText("Deduped normalized IDs")).not.toBeInTheDocument();
  });

  it("renders partial warnings and retained documents", async () => {
    const user = userEvent.setup();
    mockFetch(partialResponse);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Sales partial" }));

    expect(await screen.findByText("Partial results returned")).toBeInTheDocument();
    expect(screen.getByText(/SALES_SYSTEM reported UPSTREAM_ERROR/i)).toBeInTheDocument();
    expect(screen.getAllByText("12 month service invoice")).not.toHaveLength(0);
  });

  it("renders controlled failed response", async () => {
    const user = userEvent.setup();
    mockFetch(
      {
        code: "UPSTREAM_DOCUMENT_SYSTEMS_UNAVAILABLE",
        message: "Both upstream document systems failed.",
        requestId: "request-failed",
        vin: "1HGCM82633A00435X",
        status: "failed",
        documents: [],
        warnings: [
          { code: "UPSTREAM_ERROR", source: "SALES_SYSTEM", message: "Sales System API failed" }
        ],
        upstream: []
      },
      false,
      502
    );
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Failed" }));

    expect(await screen.findByText("UPSTREAM_DOCUMENT_SYSTEMS_UNAVAILABLE")).toBeInTheDocument();
    expect(screen.getByText("Both upstream document systems failed.")).toBeInTheDocument();
    expect(screen.queryByText(/stack/i)).not.toBeInTheDocument();
  });

  it("expands and collapses document inspection details", async () => {
    const user = userEvent.setup();
    mockFetch(completeResponse);
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Complete" }));
    const serviceRows = await screen.findAllByRole("button", { name: /12 month service invoice/i });

    await user.click(serviceRows[0]);

    expect(screen.getAllByText("Inspection detail")).not.toHaveLength(0);
    expect(screen.getAllByText("Normalized ID")).not.toHaveLength(0);
    expect(screen.getAllByText("service:service-7001")).not.toHaveLength(0);
    expect(screen.getAllByText("Search request")).not.toHaveLength(0);
    expect(screen.getAllByText("request-complete")).not.toHaveLength(0);
    expect(screen.getAllByText("repairOrderNumber")).not.toHaveLength(0);
    expect(screen.getAllByText("RO-7001")).not.toHaveLength(0);

    await user.click(serviceRows[0]);

    expect(screen.queryByText("Inspection detail")).not.toBeInTheDocument();
    expect(screen.queryByText("service:service-7001")).not.toBeInTheDocument();
  });
});
