---
'@astryxdesign/core': patch
---

[fix] Keep Spinner's documented `spinner` target on the status element that
paints the ring, including when a visible label adds a structural wrapper. Theme
size and shade overrides now reach the same visual part in labelled and
unlabelled states.

The labelled wrapper remains the public root for refs, DOM props, and consumer
styling. An unregistered private bridge carries root `style`, `className`, and
`xstyle` variable overrides into the ring, so they keep consumer precedence even
when an active theme declares the same public variables on the status target.

@cixzhang
