"""
    This module exposes a single rule, 'test_pure_tagged_correctly'.

    Within Google, a 'pure()' function is used as a hack to mark functions
    as side-effect free: http://cs/file:pure.ts%20function:pure

    Outside of Google, this function is a no-op, but instead the convention
    is to use /* #__PURE__ */ as a prefix to pure function calls.

    test_pure_tagged_correctly takes a list of srcs, and it naïvely
    checks to see if every function call to 'pure(' is prefixed with that
    annotation on the same line.
"""

def test_pure_tagged_correctly(srcs = [], **kwargs):
    native.sh_test(
        srcs = [
            "//third_party/javascript/safevalues/internals/testing:ensure_ispure.sh",
        ],
        args = [
            " ".join(["$(rootpaths %s)" % s for s in srcs]),
        ],
        data = srcs,
        **kwargs
    )
