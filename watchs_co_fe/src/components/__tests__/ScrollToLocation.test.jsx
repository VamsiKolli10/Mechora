import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ScrollToLocation from "../ScrollToLocation";

afterEach(() => vi.unstubAllGlobals());
it("scrolls to a hash section after lazy route content appears", async () => {
  const scroll = vi.fn();
  const previous = HTMLElement.prototype.scrollIntoView;
  HTMLElement.prototype.scrollIntoView = scroll;
  vi.stubGlobal("requestAnimationFrame", callback => { callback(); return 1; });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const page = target => <MemoryRouter initialEntries={["/#how-it-works"]}><ScrollToLocation />{target && <section id="how-it-works" />}</MemoryRouter>;
  const { rerender } = render(page(false));
  expect(scroll).not.toHaveBeenCalled();
  rerender(page(true));
  await waitFor(() => expect(scroll).toHaveBeenCalledOnce());
  HTMLElement.prototype.scrollIntoView = previous;
});
