import { expect, test } from "@playwright/test";

async function searchVin(page: import("@playwright/test").Page, buttonName: string) {
  await page.getByRole("button", { name: buttonName }).click();
}

test("complete VIN renders consolidated documents", async ({ page }) => {
  await page.goto("/");
  await searchVin(page, "Complete");

  await expect(page.getByText("Vehicle sales contract").first()).toBeVisible();
  await expect(page.getByText("12 month service invoice").first()).toBeVisible();
  await expect(page.getByText("Sales System").first()).toBeVisible();
  await expect(page.getByText("Service System").first()).toBeVisible();
  await expect(page.getByText("Deduped normalized IDs")).toBeVisible();
  await expect(page.getByText("SERVICE INVOICE").first()).toBeVisible();
});

test("complete VIN expands document inspection details", async ({ page }) => {
  await page.goto("/");
  await searchVin(page, "Complete");

  await page.getByRole("button", { name: /12 month service invoice/i }).click();
  const detail = page.locator('[id="document-detail-service\\:service-7001"]');

  await expect(detail.getByText("Inspection detail")).toBeVisible();
  await expect(detail.getByText("Normalized ID")).toBeVisible();
  await expect(detail.getByText("service:service-7001")).toBeVisible();
  await expect(detail.getByText("Search request")).toBeVisible();
  await expect(detail.getByText("repairOrderNumber")).toBeVisible();
  await expect(detail.getByText("RO-7001")).toBeVisible();
});

test("empty VIN renders empty state", async ({ page }) => {
  await page.goto("/");
  await searchVin(page, "Empty");

  await expect(page.getByText("No documents found")).toBeVisible();
});

test("partial VIN shows warning and retained service document", async ({ page }) => {
  await page.goto("/");
  await searchVin(page, "Sales partial");

  await expect(page.getByText("Partial results returned")).toBeVisible();
  await expect(page.getByText(/SALES_SYSTEM reported UPSTREAM_ERROR/)).toBeVisible();
  await expect(page.getByText("Service invoice").first()).toBeVisible();
});

test("failed VIN renders controlled error", async ({ page }) => {
  await page.goto("/");
  await searchVin(page, "Failed");

  await expect(page.getByText("UPSTREAM_DOCUMENT_SYSTEMS_UNAVAILABLE")).toBeVisible();
  await expect(page.getByText("Both upstream document systems failed.")).toBeVisible();
});

test("layout does not overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await searchVin(page, "Complete");
  await expect(page.getByRole("heading", { name: "Vehicle sales contract" })).toBeVisible();
  await page.getByRole("button", { name: /12 month service invoice/i }).click();
  await expect(page.locator('[id="document-mobile-detail-service\\:service-7001"]').getByText("service:service-7001")).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});
