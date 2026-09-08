<template>
  <div class="dashboard">
    <a-card :bordered="false" class="welcome-banner">
      <div class="welcome-content">
        <div class="welcome-kicker">{{ t('dashboard.kicker') }}</div>
        <div class="welcome-title">{{ t('dashboard.greeting', { name: 'Serati Ma' }) }}</div>
        <div class="welcome-desc">{{ t('dashboard.description') }}</div>
      </div>
    </a-card>

    <a-row :gutter="16" class="stats-row">
      <a-col v-for="item in stats" :key="item.title" :xs="24" :sm="12" :xl="6">
        <a-card class="stat-card" :bordered="false">
          <div class="stat-header">
            <span class="stat-title">{{ item.title }}</span>
            <div class="stat-icon" :style="{ color: item.iconColor, background: item.iconBg }">
              <component :is="item.icon" />
            </div>
          </div>
          <div class="stat-value" :style="{ color: item.valueColor }">
            + <count-to :start-val="0" :end-val="item.value" :duration="1400" />
          </div>
          <div class="stat-tip">{{ t('dashboard.trend') }}</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :title="t('dashboard.quickActions')" :bordered="false" class="actions-card">
      <a-row :gutter="16">
        <a-col v-for="action in quickActions" :key="action.title" :xs="24" :md="8">
          <div class="action-item" @click="goTo(action.path)">
            <div class="action-icon" :style="{ color: action.color, background: action.bg }">
              <component :is="action.icon" />
            </div>
            <div class="action-content">
              <div class="action-title">{{ action.title }}</div>
              <div class="action-desc">{{ action.desc }}</div>
            </div>
            <RightOutlined class="action-arrow" />
          </div>
        </a-col>
      </a-row>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserOutlined, TeamOutlined, MenuOutlined, MessageOutlined, RightOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const { t } = useI18n()

const stats = computed(() => [
  {
    title: t('dashboard.users'),
    value: 12345,
    icon: UserOutlined,
    iconColor: '#1677ff',
    iconBg: 'rgba(22, 119, 255, 0.12)',
    valueColor: '#1677ff',
  },
  {
    title: t('dashboard.roles'),
    value: 156,
    icon: TeamOutlined,
    iconColor: '#52c41a',
    iconBg: 'rgba(82, 196, 26, 0.12)',
    valueColor: '#52c41a',
  },
  {
    title: t('dashboard.menus'),
    value: 98,
    icon: MenuOutlined,
    iconColor: '#faad14',
    iconBg: 'rgba(250, 173, 20, 0.12)',
    valueColor: '#faad14',
  },
  {
    title: t('dashboard.messages'),
    value: 34567,
    icon: MessageOutlined,
    iconColor: '#f5222d',
    iconBg: 'rgba(245, 34, 45, 0.12)',
    valueColor: '#f5222d',
  },
])

const quickActions = computed(() => [
  {
    title: t('route.user'),
    desc: t('dashboard.userAction'),
    icon: UserOutlined,
    color: '#1677ff',
    bg: 'rgba(22, 119, 255, 0.12)',
    path: '/system/user',
  },
  {
    title: t('route.role'),
    desc: t('dashboard.roleAction'),
    icon: TeamOutlined,
    color: '#52c41a',
    bg: 'rgba(82, 196, 26, 0.12)',
    path: '/system/role',
  },
  {
    title: t('route.menu'),
    desc: t('dashboard.menuAction'),
    icon: MenuOutlined,
    color: '#fa8c16',
    bg: 'rgba(250, 140, 22, 0.12)',
    path: '/system/menu',
  },
])

const goTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .welcome-banner {
    position: relative;
    border-radius: 14px;
    background: linear-gradient(120deg, #1677ff 0%, #4096ff 45%, #69b1ff 100%);
    box-shadow: 0 12px 30px rgba(22, 119, 255, 0.2);
    overflow: hidden;

    :deep(.ant-card-body) {
      position: relative;
      padding: 24px 28px;
      z-index: 2;
    }

    .welcome-content {
      max-width: 780px;
    }

    .welcome-kicker {
      font-size: 12px;
      letter-spacing: 1.2px;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 8px;
    }

    .welcome-title {
      font-size: 30px;
      line-height: 1.3;
      color: #fff;
      font-weight: 700;
      margin-bottom: 8px;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    }

    .welcome-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.92);
      line-height: 1.6;
    }
  }

  .stats-row {
    margin-bottom: 0;
  }

  .stat-card {
    border-radius: 12px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
    transition: all 0.25s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      border-color: #d9e8ff;
    }

    :deep(.ant-card-body) {
      padding: 18px 20px;
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .stat-title {
        color: #595959;
        font-size: 14px;
      }

      .stat-icon {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      }
    }

    .stat-value {
      font-size: 30px;
      font-weight: 700;
      line-height: 1.15;
      margin-bottom: 6px;
    }

    .stat-tip {
      color: #8c8c8c;
      font-size: 12px;
    }
  }

  .actions-card {
    border-radius: 12px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);

    :deep(.ant-card-head) {
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.ant-card-head-title) {
      font-size: 18px;
      font-weight: 600;
      color: #262626;
    }

    .action-item {
      height: 100%;
      min-height: 102px;
      border-radius: 12px;
      border: 1px solid #f0f0f0;
      background: linear-gradient(180deg, #fff 0%, #fcfcfc 100%);
      display: flex;
      align-items: center;
      padding: 16px;
      cursor: pointer;
      transition: all 0.25s ease;

      &:hover {
        border-color: #91caff;
        box-shadow: 0 10px 24px rgba(22, 119, 255, 0.12);
        transform: translateY(-2px);

        .action-arrow {
          opacity: 1;
          transform: translateX(0);
          color: #1677ff;
        }
      }

      .action-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-right: 12px;
      }

      .action-content {
        flex: 1;
        min-width: 0;

        .action-title {
          color: #262626;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .action-desc {
          color: #8c8c8c;
          font-size: 13px;
          line-height: 1.5;
        }
      }

      .action-arrow {
        color: #bfbfbf;
        font-size: 14px;
        opacity: 0;
        transform: translateX(-4px);
        transition: all 0.25s ease;
      }
    }
  }

  @media (max-width: 992px) {
    .welcome-banner {
      :deep(.ant-card-body) {
        padding: 20px;
      }

      .welcome-title {
        font-size: 24px;
      }
    }

    .actions-card .action-item {
      margin-bottom: 12px;
    }
  }
}
</style>
