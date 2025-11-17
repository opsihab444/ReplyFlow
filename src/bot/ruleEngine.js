const { v4: uuidv4 } = require('uuid');

class RuleEngine {
  constructor(storage) {
    this.storage = storage;
    this.rules = [];
  }

  async loadRules() {
    try {
      this.rules = await this.storage.loadRules();
      console.log(`Loaded ${this.rules.length} rules`);
      return this.rules;
    } catch (error) {
      console.error('Error loading rules:', error);
      throw error;
    }
  }

  async addRule(ruleData) {
    try {
      const rule = {
        id: uuidv4(),
        pattern: ruleData.pattern,
        response: ruleData.response,
        enabled: ruleData.enabled !== undefined ? ruleData.enabled : true,
        caseSensitive: ruleData.caseSensitive !== undefined ? ruleData.caseSensitive : false,
        chatType: ruleData.chatType || 'all', // 'all', 'individual', 'group'
        delay: ruleData.delay || 0, // seconds
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.rules.push(rule);
      await this.storage.saveRules(this.rules);
      console.log(`Rule added: ${rule.id}`);
      return rule;
    } catch (error) {
      console.error('Error adding rule:', error);
      throw error;
    }
  }

  async updateRule(id, ruleData) {
    try {
      const index = this.rules.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Rule not found');
      }

      // Update rule fields
      this.rules[index] = {
        ...this.rules[index],
        pattern: ruleData.pattern !== undefined ? ruleData.pattern : this.rules[index].pattern,
        response: ruleData.response !== undefined ? ruleData.response : this.rules[index].response,
        enabled: ruleData.enabled !== undefined ? ruleData.enabled : this.rules[index].enabled,
        caseSensitive: ruleData.caseSensitive !== undefined ? ruleData.caseSensitive : this.rules[index].caseSensitive,
        chatType: ruleData.chatType !== undefined ? ruleData.chatType : this.rules[index].chatType,
        delay: ruleData.delay !== undefined ? ruleData.delay : this.rules[index].delay,
        updatedAt: new Date().toISOString()
      };

      await this.storage.saveRules(this.rules);
      console.log(`Rule updated: ${id}`);
      return this.rules[index];
    } catch (error) {
      console.error('Error updating rule:', error);
      throw error;
    }
  }

  async deleteRule(id) {
    try {
      const index = this.rules.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error('Rule not found');
      }

      this.rules.splice(index, 1);
      await this.storage.saveRules(this.rules);
      console.log(`Rule deleted: ${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw error;
    }
  }

  async toggleRule(id) {
    try {
      const rule = this.rules.find(r => r.id === id);
      if (!rule) {
        throw new Error('Rule not found');
      }

      rule.enabled = !rule.enabled;
      rule.updatedAt = new Date().toISOString();
      
      await this.storage.saveRules(this.rules);
      console.log(`Rule toggled: ${id} - enabled: ${rule.enabled}`);
      return rule;
    } catch (error) {
      console.error('Error toggling rule:', error);
      throw error;
    }
  }

  getRules() {
    return this.rules;
  }

  getRule(id) {
    return this.rules.find(r => r.id === id);
  }

  async processMessage(messageData, whatsappClient) {
    try {
      const { message, chatType, from } = messageData;

      // Find matching rule
      const matchedRule = this.findMatchingRule(message, chatType);

      if (matchedRule) {
        console.log(`Rule matched: ${matchedRule.id} for message: "${message}"`);

        // Apply delay if configured
        if (matchedRule.delay > 0) {
          console.log(`Waiting ${matchedRule.delay} seconds before replying...`);
          await this.sleep(matchedRule.delay * 1000);
        }

        // Send auto-reply
        await whatsappClient.sendMessage(from, matchedRule.response);

        return {
          matched: true,
          rule: matchedRule
        };
      }

      return {
        matched: false,
        rule: null
      };
    } catch (error) {
      console.error('Error processing message:', error);
      throw error;
    }
  }

  /**
   * Find the first matching rule for a given message
   * Rules are checked in order, and only the first match is returned
   * 
   * @param {string} message - The incoming message text
   * @param {string} chatType - Type of chat ('individual' or 'group')
   * @returns {Object|null} - Matched rule or null if no match
   */
  findMatchingRule(message, chatType) {
    // Filter enabled rules only
    const enabledRules = this.rules.filter(r => r.enabled);

    // Find first matching rule (order matters!)
    for (const rule of enabledRules) {
      // Check chat type filter
      if (rule.chatType !== 'all') {
        if (rule.chatType !== chatType) {
          continue; // Skip this rule if chat type doesn't match
        }
      }

      // Check pattern match (case-sensitive or insensitive)
      const messageToMatch = rule.caseSensitive ? message : message.toLowerCase();
      const patternToMatch = rule.caseSensitive ? rule.pattern : rule.pattern.toLowerCase();

      // Use includes() for substring matching
      if (messageToMatch.includes(patternToMatch)) {
        return rule; // Return first match
      }
    }

    return null; // No matching rule found
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get statistics
  getStats() {
    return {
      totalRules: this.rules.length,
      enabledRules: this.rules.filter(r => r.enabled).length,
      disabledRules: this.rules.filter(r => !r.enabled).length,
      rulesByType: {
        all: this.rules.filter(r => r.chatType === 'all').length,
        individual: this.rules.filter(r => r.chatType === 'individual').length,
        group: this.rules.filter(r => r.chatType === 'group').length
      }
    };
  }
}

module.exports = RuleEngine;
