# Moshav Shul Honors Generator

Generates honors for the shul

Currently supports in the configuration:
* per-person inclusions
* per-person exclusions
* system-wide combination exclusions
* per-person history counter

See basic usage demo at http://dakom.github.io/moshav-honors, or with full reporting turned on at http://dakom.github.io/moshav-honors#full

## TODO / IMPROVEMENTS

If you'd like to contribute, here's some ideas which would be great:
* testing framework
* weights for preferences (i.e. someone might not just prefer to have or not have, but rather to sometimes have)
* auto-generated weights based on history counter (in combination with preferences) - currently it's always random
* auto-generated weights based on distribution (if someone only has one potential honor, perhaps it should have more weight)
* nice ui presentation

testing framework should probably be the first priority so that we can commit the other changes more reliably

The lack of weights and distribution is a real problem preventing this from real usage... as it is each shuffle is pretty much just a random assignment, so someone could end up giving the dvar Torah 3 weeks on a row for example, which is not acceptable, while someone could end up dovening mincha 3 weeks in a row which is acceptable, for another example. The above improvements should take that into account.
