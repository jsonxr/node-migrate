// Not strictly JSON since we allow comments.

{
    // The version should either be ommited for the boostrap
    "version": "",
    "changelog": "changelog", // this is the name of the changelog table
    "tables": [
        {
            "name": "datatypes",
            "fields": [
                { "name": "bit_column", "type": "bit" }
            ]
        }
    ]
}
