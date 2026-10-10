class Solution:
    def floodFill(self, image, sr, sc, color):
        # Grow the region by sweeping the whole picture again and again: a pixel
        # of the clicked colour joins as soon as it sits beside a pixel that has
        # already joined. Stop when a full sweep adds nothing.
        rows, cols = len(image), len(image[0])
        start = image[sr][sc]
        inside = [[False] * cols for _ in range(rows)]
        inside[sr][sc] = True
        grew = True
        while grew:
            grew = False
            for r in range(rows):
                for c in range(cols):
                    if inside[r][c] or image[r][c] != start:
                        continue
                    for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
                        if 0 <= nr < rows and 0 <= nc < cols and inside[nr][nc]:
                            inside[r][c] = True
                            grew = True
                            break
        return [[color if inside[r][c] else image[r][c] for c in range(cols)]
                for r in range(rows)]
