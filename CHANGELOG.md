# [0.0.9] (2019-8-11)

## Features
- **Shorthand Validation** Shorthand (i.e. 'j','i','ilog','m', and 'r') is now checked to ensure it's value
- **General Surface Validation** General Surface card input is now tested to ensure it is valid. This includes ID number, transformation number, equation parameters, etc.

## Bug Fixes
- **Card Definition** The '&' character is now handled correctly and full-line comments can be placed in the middle of a card definition without causing it to start a new card.
- **Grammar Updates** Minor coloring and fixes for some cards

# [0.0.7] (2019-6-19)

## Features
- **Line Too Long Error** Lines that are over 80 characters long are now flagged as an error

## Bug Fixes
- **Grammar Updates** Minor coloring and fixes for some cards

## Known Bugs
- **Title Card Highlighting** Currently the Title Card has not been isolated and will be colored based on other card definitons

# [0.0.6] (2019-5-27)

## Features

## Bug Fixes
- **Argument Grammar** Fix card argument syntax errors, such as when a line ended in a alphabet charcter causing an overflow unto the next line.
- **CUT Card Grammar** CUT card is no longer colored like it's a comment card
- **Tally Comment Grammar** FCn card is now kept white to make it cleaner. No $ comments colored either

## Known Bugs
- **Title Card Highlighting** Currently the Title Card has not been isolated and will be colored based on other card definitons

# [0.0.5] (2019-5-27)

## Features

## Bug Fixes
- **White-Space Inclusion** Some of the syntax highlighting definitions only allowed a single space between data entries. Now allow any amount of white-space including tabs.

## Known Bugs
- **Title Card Highlighting** Currently the Title Card has not been isolated and will be colored based on other card definitons

# [0.0.4] (2019-5-27)

## Features
- **Syntax Highlighting** Produced a more generic grammar file that should be more robust.


## Bug Fixes

## Known Bugs
- **Title Card Highlighting** Currently the Title Card has not been isolated and will be colored based on other card definitons
