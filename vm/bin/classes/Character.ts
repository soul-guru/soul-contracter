export interface CharacterProps {
  empathy: number;
  optimism: number;
  resilience: number;
  adaptability: number;
  patience: number;
  curiosity: number;
  decisiveness: number;
  openness: number;
  creativity: number;
  integrity: number;
  humility: number;
  confidence: number;
  conscientiousness: number;
  friendliness: number;
  generosity: number;
  selfDiscipline: number;
  emotionalStability: number;
  reliability: number;
  leadership: number;
  tactfulness: number;
  tolerance: number;
  cooperativeness: number;
  assertiveness: number;
  senseOfHumor: number;
}

export class Character {
  protected name: string = "Alice"
  protected role: 'human'|'bot'|'agent'|string = "human"

  protected params: CharacterProps = {
    empathy: 0.0,
    optimism: 0.0,
    resilience: 0.0,
    adaptability: 0.0,
    patience: 0.0,
    curiosity: 0.0,
    decisiveness: 0.0,
    openness: 0.0,
    creativity: 0.0,
    integrity: 0.0,
    humility: 0.0,
    confidence: 0.0,
    conscientiousness: 0.0,
    friendliness: 0.0,
    generosity: 0.0,
    selfDiscipline: 0.0,
    emotionalStability: 0.0,
    reliability: 0.0,
    leadership: 0.0,
    tactfulness: 0.0,
    tolerance: 0.0,
    cooperativeness: 0.0,
    assertiveness: 0.0,
    senseOfHumor: 0.0
  }

  public serialize() {
    let builder = [`You are ${this.role}`]

    if (this.name) {
      builder.push(`Your name is ${this.name}`)
    }

    return builder.join(". ").trim()
  }
}