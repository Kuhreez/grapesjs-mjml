import { isComponentType } from './index.js';
import juice from 'juice';


export default (editor, { dc, coreMjmlModel, coreMjmlView }) => {
  const type = 'mj-carousel';

  dc.addType(type, {
    isComponent: isComponentType(type),

    model: {
      ...coreMjmlModel,
      defaults: {
        draggable: '[data-gjs-type=mj-column]',
        stylable: [
          'border-radius', 'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
          // 'left-icon', 'right-icon'
        ],
        traits: [{ // make it so that you have to enter text for how many images you want
          label: 'Thumbnail',
          name: 'thumbnails',
          options: [
            { value: 'visible', name: 'Visible' },
            { value: 'hidden', name: 'Hidden' },
          ],
          type: 'select',
        }],
      },
    },

    view: {
      ...coreMjmlView,

      tagName: 'tr',
      attributes: {
        style: 'font-size:0px;word-break:break-word;pointer-events: all;',
      },

      render(p, c, opts, appendChildren) {
        this.renderAttributes();
        const sandbox = document.createElement('div');
        let mjmlResult = this.getTemplateFromMjmlWithStyle();
        sandbox.innerHTML = mjmlResult.content;
        const carouselEl = sandbox.querySelector('td');

        // make all links unclickable
        carouselEl.querySelectorAll('a').forEach((link) => {
          link.removeAttribute('href');
        });

        // disable all pointer events inside carousel
        carouselEl.querySelectorAll('*').forEach((el) => {
          el.style.pointerEvents = 'none';
        });

        this.el.innerHTML = juice(`<style>${mjmlResult.style}</style>${carouselEl.outerHTML}`);
        this.renderStyle();
        return this;
      },

      getTemplateFromEl(sandboxEl) {
        return sandboxEl.firstChild.querySelector('.mj-column-per-100');
      },

      renderStyle() {
        this.el.style = this.el.getAttribute('style') + this.attributes.style;
      },

      getInnerMjmlTemplate() {
        let innerMjmlTemplate = coreMjmlView.getInnerMjmlTemplate.call(this);
        // TODO replace this with dynamic mjml images
        innerMjmlTemplate.start = `${innerMjmlTemplate.start}
          <mj-carousel-image src="https://www.mailjet.com/wp-content/uploads/2016/11/ecommerce-guide.jpg"></mj-carousel-image>
          <mj-carousel-image src="https://www.mailjet.com/wp-content/uploads/2016/09/3@1x.png"></mj-carousel-image>
          <mj-carousel-image src="https://www.mailjet.com/wp-content/uploads/2016/09/1@1x.png"></mj-carousel-image>`;
        // innerMjmlTemplate.start = `${innerMjmlTemplate.start}${this.model.getCarouselImagesMjml()}`;
        return innerMjmlTemplate;
      },

      getMjmlTemplate() {
        return {
          start: `<mjml><mj-body><mj-section><mj-column>`,
          end: `</mj-column></mj-section></mj-body></mjml>`,
        };
      },
    },
  });
};
