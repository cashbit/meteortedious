/**
 * Created by cashbit on 19/06/15.
 */


/* Information about this package */
Package.describe({
    // Short two-sentence summary.
    summary: "A tedious module wrapper for MSQL connection query and data manipulation (insert,update,delete)",
    // Version number.
    version: "1.0.0",
    // Optional.  Default is package directory name.
    name: "cashbit:meteortedious",
    // Optional github URL to your source repository.
    git: "https://github.com/cashbit/meteortedious.git"
});

/* This defines your actual package */
Package.onUse(function (api) {
    // If no version is specified for an 'api.use' dependency, use the
    // one defined in Meteor 0.9.0.
    api.versionsFrom('0.9.0');
    // Use Underscore package, but only on the server.
    // Version not specified, so it will be as of Meteor 0.9.0.
    //api.use('underscore', 'server');
    // Give users of this package access to the Templating package.
    //api.imply('templating')
    // Export the object 'Email' to packages or apps that use this package.
    api.export('sqlServerConnection', 'server');
    api.export('tdsConnection', 'server');
    // Specify the source code for the package.
    api.addFiles('meteortedious.js', 'server');
});

/* This defines the tests for the package */
/*
Package.onTest(function (api) {
    // Sets up a dependency on this package
    api.use('username:package-name');
    // Allows you to use the 'tinytest' framework
    api.use('tinytest@1.0.0');
    // Specify the source code for the package tests
    api.addFiles('email_tests.js', 'server');
});
*/
/* This lets you use npm packages in your package*/

Npm.depends({
    tedious: "1.11.2"
});