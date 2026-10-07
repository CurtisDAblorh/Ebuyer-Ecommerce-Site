import { expect, test, type Page } from "@playwright/test";

// Product imagery comes from a CDN; don't wait for every image before interacting.
const go = (page: Page, url: string) => page.goto(url, { waitUntil: "domcontentloaded" });

const priceOf = async (page: Page, index: number) =>
  Number(
    (await page.getByTestId("product-card").nth(index).getByTestId("price").innerText()).replace(
      /[£,]/g,
      "",
    ),
  );

test("browses a department and sorts by price", async ({ page }) => {
  await go(page, "/");
  await page.getByTestId("department-tech").click();
  await expect(page.getByRole("heading", { level: 1, name: "Tech" })).toBeVisible();
  await expect(page.getByTestId("product-card").first()).toBeVisible();

  await page.getByRole("combobox", { name: "Sort products" }).click();
  await page.getByRole("option", { name: "Price: low to high" }).click();
  await expect(async () => {
    expect(await priceOf(page, 0)).toBeLessThanOrEqual(await priceOf(page, 1));
  }).toPass();
});

test("filters by price with the D3 histogram brush", async ({ page, isMobile }) => {
  test.skip(isMobile, "the filter sidebar is a drawer on mobile");
  await go(page, "/shop/");
  const before = await page.getByTestId("result-count").innerText();
  const box = (await page.getByTestId("price-histogram").boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.5, { steps: 10 });
  await page.mouse.up();
  await expect(page.getByTestId("result-count")).not.toHaveText(before);
  await expect(page.getByRole("button", { name: "Clear all" })).toBeVisible();
});

test("searches with autocomplete and opens a product", async ({ page, isMobile }) => {
  await go(page, "/");
  if (isMobile) await page.getByRole("button", { name: "Search", exact: true }).click();
  const search = page.getByRole("combobox", { name: "Search products" }).locator("visible=true");
  await search.fill("iphone");
  await page
    .getByRole("option", { name: /iPhone/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/product\/\d+\//);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("iPhone");
});

test("adds from quick view and saves to the wishlist", async ({ page }) => {
  await go(page, "/shop/");
  const card = page.getByTestId("product-card").first();
  await card.getByRole("button", { name: /^Save .* to wishlist$/ }).click();
  await card.getByRole("button", { name: /^Quick view/ }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Increase quantity" }).click();
  await dialog.getByRole("button", { name: /^Add .* to bag$/ }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByTestId("cart-count")).toContainText("2");

  await go(page, "/wishlist/");
  await expect(page.getByTestId("product-card")).toHaveCount(1);
});

test("filters reviews and shows price history on a product page", async ({ page }) => {
  await go(page, "/product/1/");
  await expect(page.getByTestId("price-history").locator("path").first()).toBeAttached();
  await page.getByRole("tab", { name: /Reviews/ }).click();
  const total = await page.getByTestId("review").count();
  expect(total).toBeGreaterThan(0);
  const row = page
    .locator('[data-testid^="rating-row-"]')
    .filter({ hasNot: page.locator("text=/: 0\\./") })
    .first();
  await row.click();
  await expect(row).toHaveAttribute("aria-pressed", "true");
});

test("completes checkout and records the order", async ({ page }) => {
  await go(page, "/product/1/");
  await page
    .getByRole("button", { name: /^Add .* to bag$/ })
    .first()
    .click();
  await page.getByRole("button", { name: /^Open bag/ }).click();
  const bag = page.getByRole("presentation").filter({ has: page.getByText("Your bag") });
  await bag.getByLabel("Promo code").fill("EBUYER10");
  await bag.getByRole("button", { name: "Apply" }).click();
  await expect(bag.getByText("EBUYER10 applied")).toBeVisible();
  await bag.getByRole("link", { name: "Checkout securely" }).click();

  await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
  await page.getByRole("button", { name: "Continue to delivery" }).click();
  await expect(page.getByText("Enter your full name")).toBeVisible();

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Street address").fill("10 Downing Street");
  await page.getByLabel("Town / city").fill("London");
  await page.getByLabel("Postcode").fill("SW1A 2AA");
  await page.getByRole("button", { name: "Continue to delivery" }).click();

  await page.getByRole("radio", { name: /Express/ }).check();
  await page.getByRole("button", { name: "Continue to payment" }).click();

  await page.getByLabel("Card number").fill("4242 4242 4242 4241");
  await page.getByLabel("Name on card").fill("Ada Lovelace");
  await page.getByLabel("Expiry (MM/YY)").fill("12/39");
  await page.getByLabel("CVC").fill("123");
  await page.getByRole("button", { name: "Review order" }).click();
  await expect(page.getByText("Enter a valid card number")).toBeVisible();
  await page.getByLabel("Card number").fill("4242424242424242");
  await expect(page.getByTestId("card-preview")).toContainText("4242 4242 4242 4242");
  await page.getByRole("button", { name: "Review order" }).click();

  await expect(page.getByText("Card ending 4242")).toBeVisible();
  await page.getByRole("button", { name: /^Place order/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible({
    timeout: 10_000,
  });
  const orderId = await page.getByTestId("order-id").innerText();
  // MUI keeps the last count rendered while the badge animates out, so check visibility instead.
  await expect(page.getByTestId("cart-count").locator(".MuiBadge-badge")).toHaveClass(
    /MuiBadge-invisible/,
  );

  await page.getByRole("link", { name: "View orders & insights" }).click();
  await expect(page.getByTestId("order").first()).toContainText(orderId);
  await expect(page.getByTestId("monthly-spend").locator("rect").first()).toBeAttached();
});

test("toggles dark mode", async ({ page }) => {
  await go(page, "/");
  const html = page.locator("html");
  const wasDark = ((await html.getAttribute("class")) ?? "").includes("dark");
  await page.getByRole("button", { name: "Toggle colour theme" }).click();
  if (wasDark) await expect(html).not.toHaveClass(/dark/);
  else await expect(html).toHaveClass(/dark/);
});
