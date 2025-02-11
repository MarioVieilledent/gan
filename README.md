# Yes.

## Resources

[Textures](https://ambientcg.com)

## Run

1. Install go
2. Install wails
3. `wails dev`

## Build

### Quick build

`wails build`

### Production

1. Install upx, add env variable to exe
2. `wails build -trimpath -upx -upxflags="--lzma"`

| Command                                                       | Size comparison |
| ------------------------------------------------------------- | --------------- |
| `wails build`                                                 | 9618 kb         |
| `wails build --trimpath`                                      | 9597 kb         |
| `wails build -trimpath -upx`                                  | 3402 kb         |
| `wails build -trimpath -upx --best`                           | 3402 kb         |
| `wails build -trimpath -upx -upxflags="--best --ultra-brute"` | 2876 kb         |
| `wails build -trimpath -upx -upxflags="--lzma"`               | 2876 kb         |
