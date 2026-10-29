<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Homepage sections live in src/components/site/; scroll animations are driven globally by data-attributes (data-reveal, data-parallax, data-words, data-dim, data-rise, data-bg-shift, data-feature) in SmoothScroll.tsx — keeps motion in one place.
- Inner pages are data-driven: one /$slug route renders product, solution and info pages from components/site/registry.ts; menu/footer labels link via NavLink — avoids hundreds of route files.
- Header, Footer and SmoothScroll live in __root so every page shares them.
