// eslint-disable-next-line no-undef
const express = require('express')
const app = express()

// TODO: add proper endpoint implementations
app.get('/api/', (req, res) => res.send('Datomic Q-Builder client mock server'))

app.post('/rest/v1/query/execute/', (req, res) => {
  res.contentType('application/json')
  res.send(`{
  "total": 995,
  "hits": [
    {
      ":encounter/id": "76686",
      ":encounter/status": ":encounterStatus/in-progress",
      ":encounter/locations": [
        {
          ":location/id": "80027",
          ":location/name": "Musgrove park hospital"
        },
        {
          ":location/id": "55414",
          ":location/name": "Adam"
        },
        {
          ":location/id": "76167",
          ":location/name": "Lincoln Park Hospital"
        },
        {
          ":location/id": "76416",
          ":location/name": "33"
        }
      ]
    },
    {
      ":encounter/id": "83679",
      ":encounter/status": ":encounterStatus/in-progress",
      ":encounter/locations": [
        {
          ":location/id": "81614",
          ":location/name": "Rainforest"
        },
        {
          ":location/id": "83167",
          ":location/name": "Quatro"
        },
        {
          ":location/id": "83235",
          ":location/name": "100"
        }
      ]
    },
    {
      ":encounter/id": "76687",
      ":encounter/status": ":encounterStatus/in-progress",
      ":encounter/locations": [
        {
          ":location/id": "80027",
          ":location/name": "Musgrove park hospital"
        },
        {
          ":location/id": "55414",
          ":location/name": "Adam"
        },
        {
          ":location/id": "76167",
          ":location/name": "Lincoln Park Hospital"
        },
        {
          ":location/id": "76416",
          ":location/name": "33"
        }
      ]
    }
  ]
}
`)
})

app.get('/rest/v1/schema', (req, res) => {
  res.contentType('application/json')
  res.send(`{
  "entityTypes": {
    "patient": {
      "doc": "Entity type: patient, mapped from Demographics Patient resource",
      "attributes": {
        ":patient/id": {
          "valueType": "string",
          "identity": true,
          "doc": "The patient demographics identification"
        },
        ":patient/ehrSubjectId": {
          "valueType": "string",
          "identity": true,
          "doc": "The patient EHR subject identification"
        }
      }
    },
    "encounter": {
      "doc": "Entity type: encounter",
      "attributes": {
        ":encounter/id": {
          "valueType": "string",
          "identity": true,
          "doc": "The encounter identification"
        },
        ":encounter/externalIdentifier": {
          "valueType": "string",
          "identity": false,
          "doc": "The encounter external id"
        },
        ":encounter/subject": {
          "valueType": "ref",
          "identity": false,
          "doc": "The patient reference",
          "refType": "patient"
        },
        ":encounter/status": {
          "valueType": "ref",
          "identity": false,
          "doc": "Encounter status e.g. planned | arrived | triaged | in-progress etc, see :encounterStatus/* for enum values",
          "refType": "encounterStatus"
        },
        ":encounter/class": {
          "valueType": "ref",
          "identity": true,
          "doc": "Encounter status e.g. :encounterClass/IMP(impatient),:encounterClass/ACUTE (acute) etc., see :encounterClass/* for enum values",
          "refType": "encounterClass"
        },
        ":encounter/locations": {
          "valueType": "ref",
          "identity": true,
          "doc": "references to all types of location related to encounter",
          "refType": "location"
        }
      }
    },
    "location": {
      "doc": "Entity type: location",
      "attributes": {
        ":location/id": {
          "valueType": "string",
          "identity": true,
          "doc": "Entity type: location, originated from Location Demographics resource"
        },
        ":location/externalIdentifier": {
          "valueType": "string",
          "identity": false,
          "doc": "The location external id"
        },
        ":location/name": {
          "valueType": "string",
          "identity": false,
          "doc": "The location name"
        },
        ":location/status": {
          "valueType": "ref",
          "identity": false,
          "doc": "The location reference to location status e.g. active, inactive, suspended. See :locationStatus/* enum",
          "refType": "locationStatus"
        },
        ":location/type": {
          "valueType": "ref",
          "identity": false,
          "doc": "The location reference location types e.g. bed, ward, etc. See :locationType/* enum",
          "refType": "locationType"
        },
        ":location/partOf": {
          "valueType": "ref",
          "identity": false,
          "doc": "Reference to another Location this one is physically a part of",
          "refType": "location"
        }
      }
    },
    "codeableConcept": {
      "doc": "Entity type: codeableConcept",
      "attributes": {
        ":codeableConcept/id": {
          "valueType": "string",
          "identity": true,
          "doc": "The codeableConcept  identification"
        },
        ":codeableConcept/system": {
          "valueType": "string",
          "identity": false,
          "doc": "The codeableConcept identification system"
        },
        ":codeableConcept/code": {
          "valueType": "string",
          "identity": false,
          "doc": "The location identification code in system"
        }
      }
    },
    "textableConcept": {
      "doc": "Entity type: textableConcept",
      "attributes": {
        ":textableConcept/id": {
          "valueType": "string",
          "identity": true,
          "doc": "The textableConcept identification"
        }
      }
    },
    "composition": {
      "doc": "Entity type: composition, root entity of EHR composition",
      "attributes": {
        ":composition/id": {
          "valueType": "string",
          "identity": true,
          "doc": "The composition identification"
        },
        ":composition/ehrId": {
          "valueType": "string",
          "identity": false,
          "doc": "The composition EHR identification"
        },
        ":composition/version": {
          "valueType": "string",
          "identity": false,
          "doc": "The composition version"
        },
        ":composition/ehrRecords": {
          "valueType": "ref",
          "identity": false,
          "doc": "The composition records, obtained from EHR (e.g. diagnosis, medicationOrder, ...)",
          "refType": "aqlRecord"
        }
      }
    },
    "diagnosis": {
      "doc": "Entity type: Diagnosis",
      "attributes": {
        ":diagnosis/patient": {
          "valueType": "ref",
          "identity": false,
          "doc": "The patient reference",
          "refType": "patient"
        },
        ":diagnosis/code": {
          "valueType": "ref",
          "identity": false,
          "doc": "Identification of the index problem, issue or diagnosis",
          "refType": "concept"
        },
        ":diagnosis/course": {
          "valueType": "ref",
          "identity": false,
          "doc": "The pattern or evolution of the problem or diagnosis: Chronic|Relapsing|Acute",
          "refType": "codeableConcept"
        },
        ":diagnosis/occurrenceDate": {
          "valueType": "instant",
          "identity": false,
          "doc": "The occurrence datetime of the diagnosis"
        },
        ":diagnosis/effectiveDate": {
          "valueType": "instant",
          "identity": false,
          "doc": "Clinically relevant datetime of diagnosis"
        }
      }
    },
    "immunization": {
      "doc": "Entity type: Immunization",
      "attributes": {
        ":immunization/patient": {
          "valueType": "ref",
          "identity": false,
          "doc": "The patient reference",
          "refType": "patient"
        },
        ":immunization/occurrenceDate": {
          "valueType": "instant",
          "identity": false,
          "doc": "The occurrence datetime of the immunization"
        },
        ":immunization/expirationDate": {
          "valueType": "instant",
          "identity": false,
          "doc": "The expiration datetime of the immunization"
        },
        ":immunization/vaccineCode": {
          "valueType": "ref",
          "identity": false,
          "doc": "Identification of the index problem, issue or diagnosis",
          "refType": "concept"
        },
        ":immunization/doseQuantity": {
          "valueType": "long",
          "identity": false,
          "doc": "Dose quantity value"
        },
        ":immunization/doseUnit": {
          "valueType": "ref",
          "identity": false,
          "doc": "The reference to does unit register, for example [ml]",
          "refType": "codeableConcept"
        },
        ":immunization/sequenceNo": {
          "valueType": "long",
          "identity": false,
          "doc": "Sequence number value"
        },
        ":immunization/route": {
          "valueType": "ref",
          "identity": false,
          "doc": "The reference to register of the route by which the medication is administered (e.g. oral, sublingual etc)",
          "refType": "concept"
        },
        ":immunization/accordingToVaccinationProgram": {
          "valueType": "boolean",
          "identity": false,
          "doc": "If patient has been vaccinated according the vaccination program of RS?"
        }
      }
    },
    "medicationOrder": {
      "doc": "Entity type: MedicationOrder",
      "attributes": {
        ":medicationOrder/patient": {
          "valueType": "ref",
          "identity": false,
          "doc": "The patient reference",
          "refType": "patient"
        },
        ":medicationOrder/occurrenceDate": {
          "valueType": "instant",
          "identity": false,
          "doc": "The event occurrence date"
        },
        ":medicationOrder/effectiveDate": {
          "valueType": "instant",
          "identity": false,
          "doc": "Order start date/time"
        },
        ":medicationOrder/route": {
          "valueType": "ref",
          "identity": false,
          "doc": "The route by which the ordered item is to be administered into the subject's body. For example: oral, intravenous, or topical",
          "refType": "concept"
        },
        ":medicationOrder/componentCode": {
          "valueType": "ref",
          "identity": false,
          "doc": "Medication or medication component, ref to codeableConcept",
          "refType": "concept"
        },
        ":medicationOrder/amount": {
          "valueType": "double",
          "identity": false,
          "doc": "The value of the amount of medication or medication component"
        },
        ":medicationOrder/amountUnit": {
          "valueType": "string",
          "identity": false,
          "doc": "The unit of the amount of medication or medication component"
        },
        ":medicationOrder/doseAmount": {
          "valueType": "double",
          "identity": false,
          "doc": "The value of the amount of medication administered at one time"
        },
        ":medicationOrder/doseAmountUnit": {
          "valueType": "string",
          "identity": false,
          "doc": "The unit which is associated with the Dose amount. For example: tablet, mg"
        }
      }
    }
  },
  "enums": {
    "encounterStatus": {
      "values": {
        ":encounterStatus/planned": {},
        ":encounterStatus/inProgress": {},
        ":encounterStatus/finished": {}
      }
    },
    "encounterClass": {
      "values": {
        ":encounterClass/AMB": {},
        ":encounterClass/IMP": {},
        ":encounterClass/VR": {},
        ":encounterClass/ACUTE": {}
      }
    },
    "locationStatus": {
      "values": {
        ":locationStatus/active": {},
        ":locationStatus/inactive": {},
        ":locationStatus/suspended": {}
      }
    },
    "locationType": {
      "values": {
        ":locationType/bd": {},
        ":locationType/wa": {},
        ":locationType/si": {}
      }
    }
  },
  "interfaces": {
    "concept": {
      "attributes": {
        ":concept/value": {
          "valueType": "string",
          "identity": false,
          "doc": "The concept text, can be used as part of codeableConcept or textConcept entity"
        }
      }
    },
    "aqlRecord": {}
  }
}`)
})

app.get('/rest/v1/entity/:id', (req, res) => {
  res.contentType('application/json')
  res.send(`{
  ":reverse-attributes": {
    ":location/partOf": 776,
    ":encounter/locations": 522
  },
  ":demographicsResource/versionId": "4",
  ":demographicsResource/lastUpdated": "2021-11-25T16:40:59.317+00:00",
  ":location/type": [
    ":locationType/fa"
  ],
  ":location/name": "Musgrove park hospital",
  ":db/id": 17592186045437,
  ":location/status": ":locationStatus/active",
  ":entityType": ":location",
  ":location/id": "80027"
}`)
})
app.get('/rest/v1/entity/reverse/:id/', (req, res) => {
  res.contentType('application/json')
  res.send(`[
  {
    ":db/id": 17592186050313
  },
  {
    ":db/id": 17592186050316
  },
  {
    ":db/id": 17592186050322
  }
]`)
})

app.listen(8001, () => console.log('Server running'))
