# Spreadsheet Engine

An object-oriented design drill, written for this app. There is no LeetCode page for it.

## The task

Build the core of a spreadsheet. Cells are named by one capital letter and a row number, like `A1` or `Z1000`. Every cell starts empty, and an empty cell reads as `0`. Implement `class Spreadsheet`:

- `Spreadsheet()`: an empty sheet.
- `set(cell, value)`: `value` is either an integer, or a formula string. A formula starts with `=` and adds one or more terms with `+`. Each term is a cell name or a non-negative integer, for example `"=A1+B2+7"`. The same cell may appear more than once, and each appearance counts. Return `true` if the sheet accepts the value.
- `get(cell)`: return the cell's current number.

Values stay live. When a cell changes, every cell whose formula depends on it, directly or through other cells, must show the new result.

A formula that would make a cell depend on itself is a cycle. Reject it: return `false` and leave the whole sheet exactly as it was, including that cell's old value or formula.

The tests drive the class LeetCode-style: a list of operation names and a matching list of argument lists, with the constructor first. The expected output holds one entry per operation: `null` for the constructor, `true` or `false` for `set`, a number for `get`.

## Examples

**Example 1**

```
ops  = ["Spreadsheet","set","set","set","get","set","get","get"]
args = [[],["A1",5],["B1","=A1+A1"],["C1","=B1+A1"],["C1"],["A1",2],["B1"],["C1"]]
                                                    -> [null,true,true,true,15,true,4,6]
```

C1 reads B1 and A1. When A1 becomes 2, B1 must update to 4 before C1 is recomputed, so C1 ends at 4 + 2 = 6.

**Example 2**

```
ops  = ["Spreadsheet","set","set","set","get","get","set","get"]
args = [[],["A1",5],["B1","=A1+1"],["A1","=B1+1"],["A1"],["B1"],["A1",7],["B1"]]
                                                    -> [null,true,true,false,5,6,true,8]
```

B1 reads A1, so A1 can't read B1. That `set` is rejected and A1 keeps its 5. Setting A1 to a plain number later is fine.

**Example 3**

```
ops  = ["Spreadsheet","set","set","get","set","set","get"]
args = [[],["A1",3],["B1","=A1+10"],["B1"],["B1",4],["A1",100],["B1"]]
                                                    -> [null,true,true,13,true,true,4]
```

Once B1 holds a plain 4, it no longer depends on A1. Changing A1 must leave it alone.

## Constraints

- A cell name is one letter `A` to `Z` followed by a row from `1` to `1000`.
- A formula has 1 to 50 terms, no spaces. Number terms are between `0` and `1000`.
- Plain integer values are between `-10^4` and `10^4`.
- Every number the sheet produces fits in a 64-bit integer.
- Up to `3 * 10^4` operations in total. Reads far outnumber writes.

## Aim for

`get` in `O(1)`: cache each cell's number and do the work in `set`. That needs a graph. Each cell stores the cells it reads and the cells that read it. On `set`, collect everything downstream of the cell. If the new formula reads any of those, it's a cycle. Otherwise swap the old edges for the new ones and recompute the downstream cells in **topological order**, so nobody is recomputed before its inputs. Cost of `set`: `O(affected cells + their edges)`.

## Follow-ups

- Support ranges like `=SUM(A1:C3)`. What happens to the graph when a range covers 10,000 cells?
- Flip the trade-off: writes are frequent and reads are rare. What would you make lazy?
- A single `set` affects a million cells. How would you avoid blocking the UI?
- Add `undo()`. What does each `set` need to remember?
