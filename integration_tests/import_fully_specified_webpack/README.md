Fake project that depends on safevalues and uses settings that require all files
(including dependencies) to use full file extension when they import by path.
This constraint is increasingly common in OSS. Webpack requires this by default.
Other popular tools like create-react-app built on it also do.

Examples:

-   https://github.com/facebook/create-react-app/issues/11865
-   https://stackoverflow.com/questions/70559396/how-can-i-fix-the-breaking-change-webpack-5-used-to-include-polyfills-for-no
