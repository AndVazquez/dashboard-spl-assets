#!/usr/bin/env python
import json
import sys
import errno
import xmltodict
import jsbeautifier
from lxml import etree
import jinja2
from TFM.jinja2 import check_attributes
from TFM.settings import STATIC_URL
from django.urls import reverse
from restriction_validator import restriction_validation
import sys, traceback
import os, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TFM.settings")
django.setup()

from django.contrib.auth.models import User

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
XSD_FILE = "TFM/configs/schema/schema.xsd"

TEMPLATES = {
    'ScatterDiagram': {
        'template_path': 'js/components/scatter/scatter.js',
        'rendered_path': 'js/components/scatter/{0}.js',
        'query_handler_template_path': 'js/graphql-query-handlers/scatter-query-handler.js',
        'query_handler_rendered_path': 'js/graphql-query-handlers/{0}-query-handler.js'
    },
    'Heatmap': {
        'template_path': 'js/components/heat-map/heat-map.js',
        'rendered_path': 'js/components/heat-map/{0}.js',
        'query_handler_template_path': 'js/graphql-query-handlers/heatmap-query-handler.js',
        'query_handler_rendered_path': 'js/graphql-query-handlers/{0}-query-handler.js'
    },
    'ChordDiagram': {
        'template_path': 'js/components/chord/chord-diagram.js',
        'rendered_path': 'js/components/chord/{0}.js',
        'query_handler_template_path': 'js/graphql-query-handlers/chord-query-handler.js',
        'query_handler_rendered_path': 'js/graphql-query-handlers/{0}-query-handler.js'
    },
    'DataFilter': {
        'template_path': 'js/components/filter/global-filter.js',
        'rendered_path': 'js/components/filter/global-filter.js',
    },
    'DataFilters': {
        'template_path': 'js/components/filter/component-filter.js',
        'rendered_path': 'js/components/filter/{0}-component-filter.js',
    },
    'Map': {
        'template_path': 'js/components/map/map.js',
        'rendered_path': 'js/components/map/map.js',
    }
}

TEMPLATES_PATH = 'templates/j2-templates/'
HTML_TEMPLATE_PATH = 'html/dashboard/dashboard-base.html'
MAIN_JS_TEMPLATE_PATH = 'js/main.js'

env = jinja2.Environment(loader=jinja2.FileSystemLoader('.'),
                         autoescape=jinja2.select_autoescape(['html', 'xml', 'js']),
                         trim_blocks=True,
                         lstrip_blocks=True)

env.globals.update({
    'static': STATIC_URL,
    'url': reverse,
})
env.filters['check'] = check_attributes


def relative_project_path(*x):
    return os.path.join(os.path.abspath(os.path.dirname(__file__)), *x)


'''
    generate_source_files_from_context(context):

    GENERATES AND DEPLOYS ALL THE SOURCE CODE GIVEN A PARTICULAR CONFIGURATION
    The function's input is the XML configuration previously parsed
    The configuration is explored and the templates for every component specified are
    rendered with the selected features, generating the necessary HTML and JavaScript code
    and deploying it at the pertinent static folders of the system
'''


def generate_source_files_from_context(context, user):
    page_source_path = str(relative_project_path('TFM/static')) + '/generated/' + str(user) + '/'
    current_page = 1
    if 'current_page' in context.keys():
        page_source_path = str(relative_project_path('TFM/static')) + '/generated/' + str(user) + '/' \
                           + str(context['current_page']) + '/'
        current_page = context['current_page']
        try:
            os.makedirs(os.path.dirname(page_source_path))
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise

    if type(context['Components']['Component']) != list:
        context['Components']['Component'] = [context['Components']['Component']]

    for component in context['Components']['Component']:
        for component_type, component_configuration in component.items():

            try:
                if 'DataFilters' in component_configuration['Controls'].keys():
                    base_component_path = TEMPLATES['DataFilters']['rendered_path'] \
                        .format(component_configuration['@component_id'])

                    generated_file = page_source_path + str(base_component_path)

                    try:
                        os.makedirs(os.path.dirname(generated_file))
                    except OSError as e:
                        if e.errno != errno.EEXIST:
                            raise

                    template = env.get_template(TEMPLATES_PATH + TEMPLATES['DataFilters']['template_path'].format(
                        component_configuration['@component_id']))
                    try:
                        configuration = {'Component': component_configuration}
                        result = template.render(configuration)

                        result = jsbeautifier.beautify(str(result))

                        with open(generated_file, 'w') as static_file:
                            static_file.write(result)
                    except Exception as e:
                        print("Exception: " + str(e))
                        print('-' * 60)
                        traceback.print_exc(file=sys.stdout)
                        print('-' * 60)
            except:
                pass

            base_component_path = TEMPLATES[component_type]['rendered_path'] \
                .format(component_configuration['@component_id'])

            generated_file = page_source_path + str(base_component_path)

            try:
                os.makedirs(os.path.dirname(generated_file))
            except OSError as e:
                if e.errno != errno.EEXIST:
                    raise

            template = env.get_template(TEMPLATES_PATH + TEMPLATES[component_type]['template_path'])
            try:
                configuration = {'Component': component_configuration}
                result = template.render(configuration)

                result = jsbeautifier.beautify(str(result))

                with open(generated_file, 'w') as static_file:
                    static_file.write(result)
            except Exception as e:
                print("Exception: " + str(e))
                print('-' * 60)
                traceback.print_exc(file=sys.stdout)
                print('-' * 60)

            base_qh_path = TEMPLATES[component_type]['query_handler_rendered_path'] \
                .format(component_configuration['@component_id'])

            generated_file = page_source_path + str(base_qh_path)

            try:
                os.makedirs(os.path.dirname(generated_file))
            except OSError as e:
                if e.errno != errno.EEXIST:
                    raise

            template = env.get_template(TEMPLATES_PATH + TEMPLATES[component_type]['query_handler_template_path'])

            try:
                configuration = {'Component': component_configuration}
                result = template.render(configuration)

                result = jsbeautifier.beautify(str(result))

                with open(generated_file, 'w') as static_file:
                    static_file.write(result)
            except Exception as e:
                print("Exception: " + str(e))
                print('-' * 60)
                traceback.print_exc(file=sys.stdout)
                print('-' * 60)

            if 'Controls' in component_configuration.keys():
                if 'Map' in component_configuration['Controls'].keys():
                    base_component_path = TEMPLATES['Map']['rendered_path'] \
                        .format(component_configuration['@component_id'])

                    generated_file = page_source_path + str(base_component_path)

                    try:
                        os.makedirs(os.path.dirname(generated_file))
                    except OSError as e:
                        if e.errno != errno.EEXIST:
                            raise

                    template = env.get_template(TEMPLATES_PATH + TEMPLATES['Map']['template_path'])
                    try:
                        configuration = {'Component': component_configuration}
                        result = template.render(configuration)

                        result = jsbeautifier.beautify(str(result))

                        with open(generated_file, 'w') as static_file:
                            static_file.write(result)
                    except Exception as e:
                        print("Exception: " + str(e))
                        print('-' * 60)
                        traceback.print_exc(file=sys.stdout)
                        print('-' * 60)

    if 'DataFilter' in context.keys():
        component_type = 'DataFilter'
        component_configuration = context['DataFilter']

        base_component_path = TEMPLATES[component_type]['rendered_path']
        generated_file = page_source_path + str(base_component_path)

        try:
            os.makedirs(os.path.dirname(generated_file))
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise

        template = env.get_template(TEMPLATES_PATH + TEMPLATES[component_type]['template_path'])
        try:
            component_configuration = {'DataFilter': component_configuration}
            result = template.render(component_configuration)

            result = jsbeautifier.beautify(str(result))

            with open(generated_file, 'w') as static_file:
                static_file.write(result)
        except Exception as e:
            print("Exception: " + str(e))

    generated_file = page_source_path + "js/main" + str(current_page) + ".js"

    try:
        os.makedirs(os.path.dirname(generated_file))
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    template = env.get_template(TEMPLATES_PATH + MAIN_JS_TEMPLATE_PATH)

    try:
        result = template.render(context)

        with open(generated_file, 'w') as static_file:
            static_file.write(result)
    except Exception as e:
        print("Exception: " + str(e))
        print('-' * 60)
        traceback.print_exc(file=sys.stdout)
        print('-' * 60)

    generated_file = page_source_path + "page" + str(current_page) + ".html"

    try:
        os.makedirs(os.path.dirname(generated_file))
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    template = env.get_template(TEMPLATES_PATH + HTML_TEMPLATE_PATH)

    try:
        result = template.render(context)

        with open(generated_file, 'w') as static_file:
            static_file.write(result)
    except Exception as e:
        print("Exception: " + str(e))
        print('-' * 60)
        traceback.print_exc(file=sys.stdout)
        print('-' * 60)


def main():
    if len(sys.argv) == 1:
        users = [13, 30, 88]
    else:
        users = [sys.argv[1]]

    print("\nGenerating source code for " + str(len(users)) + " user(s)")

    try:
        for i, user in enumerate(users):
            username = User.objects.get(pk=user).username
            user_staff = User.objects.get(pk=user).is_staff

            print("\nUser " + str(i + 1) + " of " + str(len(users)) + " (" + str(username) + ")")
            try:
                path = relative_project_path('TFM/configs/' + str(user) + '/')
                config_path = path + "dashboard-configuration.xml"
                f = open(config_path, 'rU')
            except:
                print("There is no configuration for user " + str(username) + ", create one first.")
                raise

            e = etree.parse(f)
            try:
                e.xinclude()
            except Exception as excp:
                print(excp)

            xsd_root = etree.parse(XSD_FILE)
            schema = etree.XMLSchema(xsd_root)
            structure_valid = schema.validate(e)

            if structure_valid:
                o = xmltodict.parse(etree.tostring(e))
                product_line = json.loads(json.dumps(o))
                valid, errors = restriction_validation(user_staff, product_line)

                if valid:
                    if 'PageGroup' in product_line['Dashboard']['ScreensConfig']:
                        for page_config in product_line['Dashboard']['ScreensConfig']['PageGroup']['Page']:
                            context = page_config
                            context.update({'NavigationBar': product_line['Dashboard']['NavigationBar']})
                            context.update({'Title': product_line['Dashboard']['Title']})
                            context.update({'current_page': str(context['@page_id'])})
                            context.update(
                                {'user_url': STATIC_URL + 'generated/' + str(user) + '/' + str(context['@page_id']) + '/'})
                            context.update({'User': username})

                            generate_source_files_from_context(context, user)
                    else:
                        context = product_line['Dashboard']['ScreensConfig']['Page']
                        context.update({'NavigationBar': product_line['Dashboard']['NavigationBar']})
                        context.update({'Title': product_line['Dashboard']['Title']})
                        context.update({'current_page': str(context['@page_id'])})
                        context.update(
                            {'user_url': STATIC_URL + 'generated/' + str(user) + '/' + str(context['@page_id']) + '/'})
                        context.update({'User': username})

                        generate_source_files_from_context(context, user)

                    print("Code generated.")
                else:
                    print(errors)
            else:
                print(schema.error_log)
    except:
        pass

if __name__ == '__main__':
    main()
