class Solution:
    def romanToInt(self, s):
        # Write out every numeral from 1 to 3999 the standard way, greedily,
        # then look s up.
        parts = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"),
                 (90, "XC"), (50, "L"), (40, "XL"), (10, "X"), (9, "IX"),
                 (5, "V"), (4, "IV"), (1, "I")]
        table = {}
        for n in range(1, 4000):
            out, rest = [], n
            for amount, symbols in parts:
                while rest >= amount:
                    out.append(symbols)
                    rest -= amount
            table["".join(out)] = n
        return table[s]
