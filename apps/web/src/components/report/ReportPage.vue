<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { AccessibilityReport } from '@a11y-agent-ops/shared'

import ClientReportView from '@/components/report/audiences/ClientReportView.vue'
import DeveloperReportView from '@/components/report/audiences/DeveloperReportView.vue'
import ProductReportView from '@/components/report/audiences/ProductReportView.vue'
import QaReportView from '@/components/report/audiences/QaReportView.vue'
import ReportAudienceTabs from '@/components/report/ReportAudienceTabs.vue'
import ReportSummary from '@/components/report/ReportSummary.vue'
import { toReportPresentation, type ReportAudience } from '@/lib/report'

const props = defineProps<{
  report: AccessibilityReport
}>()

const emit = defineEmits<{
  reset: []
}>()

const audience = ref<ReportAudience>('developer')

const presentation = computed(() => toReportPresentation(props.report))

watch(
  () => props.report.targetUrl,
  () => {
    audience.value = 'developer'
  },
)
</script>

<template>
  <div class="space-y-6">
    <ReportSummary :presentation="presentation" @reset="emit('reset')" />

    <ReportAudienceTabs v-model="audience" />

    <div role="tabpanel" class="min-h-72">
      <DeveloperReportView
        v-if="audience === 'developer'"
        :issues="presentation.issues"
      />
      <QaReportView
        v-else-if="audience === 'qa'"
        :issues="presentation.issues"
      />
      <ProductReportView
        v-else-if="audience === 'product'"
        :presentation="presentation"
      />
      <ClientReportView
        v-else
        :presentation="presentation"
      />
    </div>
  </div>
</template>
