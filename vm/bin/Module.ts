// Load basics

class Module {
  private url: string
  private isActive = true

  public name: string
  public description: string
  public exampleBody: object = {}

  constructor(
    url,
    name,
    description,
    exampleBody
  ) {
    this.url = url
    this.name = name
    this.exampleBody = exampleBody
    this.description = description
  }

  async call(body) {
    let config = {
      url: this.url,
      data: body,
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }

    //@ts-ignore
    return (await axios(config)).data
  }
}

