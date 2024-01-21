const Modules = {
  bm3d_horizon: {
    listen: new Module(
      "http://62.197.49.215:1101/opt/brain/listen",
      "bm3d Horizon",
      "",
      {
        "body": "Hello, I am a John!",
        "namespace": "DIALOG_ID or USER_ID"
      }
    ),

    find: new Module(
      "http://62.197.49.215:1101/opt/brain/find",
      "bm3d Horizon",
      "",
      {
        "body": "Hello, I am a John!",
        "namespace": "DIALOG_ID or USER_ID"
      }
    )
  }
}