"""Definitions for safevalues size tests."""

load("//javascript/closure/builddefs:builddefs.bzl", "CLOSURE_EXTERNS")
load("//tools/build_defs/golden_test:def.bzl", "golden_test")
load("//tools/build_defs/js:rules.bzl", "js_binary")

def js_binary_golden(name, out, defs, deps):
    """A golden test for the compiled output of a js_library.

    Args:
          name: name for the test.
          out: the golden file.
          defs: build flags for the js_binary.
          deps: dependencies for the js_binary.
    """
    js_binary(
        name = name + "_bin",
        defs = defs + [
            # Irrelevant to compilation, but easier to analyze output.
            "--generate_pseudo_names",
            "--pretty_print",
        ],
        externs_list = CLOSURE_EXTERNS,
        deps = deps,
        testonly = True,
    )

    golden_test(
        name = name + "_golden",
        golden = out,
        subject = ":%s_bin.js" % name,
    )
