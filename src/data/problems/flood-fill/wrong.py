# Spreads into every pixel that isn't the new colour yet, instead of only the
# pixels that share the clicked pixel's original colour, so the paint leaks
# across the whole picture.
class Solution:
    def floodFill(self, image, sr, sc, color):
        rows, cols = len(image), len(image[0])

        def fill(r, c):
            if r < 0 or r >= rows or c < 0 or c >= cols or image[r][c] == color:
                return
            image[r][c] = color
            fill(r + 1, c)
            fill(r - 1, c)
            fill(r, c + 1)
            fill(r, c - 1)

        fill(sr, sc)
        return image
