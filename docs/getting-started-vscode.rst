.. _getting-started-vscode:

Getting Started with VS Code
============================

The easiest way to try out Flow yourself is to clone this repository and use `VSCode Remote Containers`_.
This guide will walk you through getting started.

#. Make sure you have `VS Code Installed`_.
#. Follow the steps to setup `VSCode Remote Containers`_
#. Clone the flow docs repo (``git clone https://github.com/estuary/docs flow-docs``)
#. Open the newly created ``flow-docs`` directory in VS Code. Select
   ``Remote-Containers: Open Folder In Container...`` from the command pallette and select the
   ``flow-docs`` directory. Alternatively, you can just open the ``flow-docs`` directory normally,
   and then click on "Reopen in Container" when the notification pops up.
#. You're ready to use Flow! Try opening a terminal within VS Code and running the tests for the example catalog:

    .. code-block:: console

       # Build this documentation repository's Flow catalog.
       $ flowctl build

       # Run all catalog tests.
       $ flowctl test


.. _`VS Code Installed`: https://code.visualstudio.com/download
.. _`VSCode Remote Containers`: https://code.visualstudio.com/docs/remote/containers


