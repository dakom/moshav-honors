# Moshav Honors Generator

Generates honors for the shul

Currently supports in the configuration:
* per-person inclusions
* per-person exclusions
* system-wide combination exclusions
* per-person history counter

The configuration is supplied as a json string. 

Demo will print the updated configuration with history. You can easily use that to feed back in (i.e. for subsequent runs, perhaps to generate a whole year's worth of assignments).

If you'd like to contribute, here's some ideas which would be great:
* testing framework
* weights for preferences (i.e. someone might not just prefer to have or not have, but rather to sometimes have)
* auto-generated weights based on history counter (in combination with preferences)
* nice ui presentation
