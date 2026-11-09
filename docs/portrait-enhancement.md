# Portrait enhancement

The homepage now follows the GitHub avatar automatically (see `src/lib/portrait.ts`). `public/images/mohamed-shez-enhanced.png` remains only as the fallback for when GitHub is unreachable. It was generated with the built-in image editing tool from the original GitHub portrait retained at `public/images/mohamed-shez.jpg`. Next.js serves responsive optimized versions.

## Final prompt

Use case: identity-preserve. Edit target: supplied original portrait photograph. Make a conservative high-resolution photographic restoration for a professional personal website, square 1024x1024. Reduce JPEG compression and pixelation, restore modest crisp detail in eyes, hair and jacket fabric. Preserve EXACT facial identity, proportions, asymmetry, expression, age, skin tone, pose, hairline, clothing, framing and original blurred background. Keep natural pores and faint stubble, realistic photographic grain. Do not beautify, reshape, retouch away normal skin texture, change smile, whiten teeth, enlarge eyes, relight dramatically, invent accessories, or produce waxy skin. Aim to look like the original camera photo with better clarity, not an AI headshot. No text or watermark.
