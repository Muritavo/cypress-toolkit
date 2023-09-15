import "cypress-real-events/support"
import 'cypress-wait-until'
import 'cypress-file-upload'
import '@cypress/code-coverage/support'
import "./visual-testing"
import "./emulator"
import "./findingElements"
import "./utility"
import "./rendering"
import "./augmentation/cypress"
import "./blockchain"
import "./interaction"

require('@cypress/snapshot').register()
require("./extensions/it.each")();